import { useEffect, useState } from 'react';
import api from '../../services/api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/ui/Spinner';

function FilterBar({ filters, onChange, onReset }) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={filters.direction}
        onChange={e => onChange('direction', e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[var(--cbe)] text-gray-700 transition-all"
      >
        <option value="">All directions</option>
        <option value="IN">Money In</option>
        <option value="OUT">Money Out</option>
      </select>

      <input
        type="date"
        value={filters.from}
        onChange={e => onChange('from', e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[var(--cbe)] text-gray-700 transition-all"
      />

      <input
        type="date"
        value={filters.to}
        onChange={e => onChange('to', e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-[var(--cbe)] text-gray-700 transition-all"
      />

      {(filters.direction || filters.from || filters.to) && (
        <button
          onClick={onReset}
          className="text-sm font-medium text-gray-400 hover:text-gray-600 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function TxRow({ tx }) {
  const isIn = tx.direction === 'IN';
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIn ? 'bg-green-50' : 'bg-red-50'}`}>
        <svg className={`w-4 h-4 ${isIn ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {isIn
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          }
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{tx.category ?? 'Other'}</p>
        {tx.reason && <p className="text-xs text-gray-400 mt-0.5 truncate">{tx.reason}</p>}
        <p className="text-xs text-gray-300 mt-0.5">
          {new Date(tx.happenedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <p className={`text-sm font-bold shrink-0 ${isIn ? 'text-green-600' : 'text-red-500'}`}>
        {isIn ? '+' : '-'}{tx.amount.toLocaleString()} ETB
      </p>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-5">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, i, arr) => {
          if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="text-gray-400 text-sm px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
              style={p === page
                ? { backgroundColor: 'var(--cbe)', color: 'white' }
                : { border: '1px solid #e5e7eb', color: '#6b7280' }
              }
            >
              {p}
            </button>
          )
        )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

const defaultFilters = { direction: '', from: '', to: '' };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (f.direction) params.set('direction', f.direction);
      if (f.from) params.set('from', new Date(f.from).toISOString());
      if (f.to) params.set('to', new Date(f.to).toISOString());

      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.data ?? []);
      setMeta({ total: data.total, totalPages: data.totalPages });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);
    fetchTransactions(updated, 1);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPage(1);
    fetchTransactions(defaultFilters, 1);
  };

  const handlePage = p => {
    setPage(p);
    fetchTransactions(filters, p);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-400 text-sm mt-0.5">{meta.total} total</p>
        </div>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">No transactions found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="px-5">
            {transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <div className="px-5 pb-5">
            <Pagination page={page} totalPages={meta.totalPages} onPage={handlePage} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
