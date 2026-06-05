import { useEffect, useState } from 'react';
import api from '../../services/api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/ui/Spinner';

const currentPeriod = new Date().toISOString().slice(0, 7);

function PeriodSelector({ period, onChange }) {
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }

  return (
    <select
      value={period}
      onChange={e => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none text-gray-700 transition-all"
      style={{ '--tw-ring-color': 'var(--cbe)' }}
      onFocus={e => (e.target.style.borderColor = 'var(--cbe)')}
      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
    >
      {months.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  );
}

function SummaryCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2.5}>
            {icon}
          </svg>
        </div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function BreakdownBar({ category, amount, total }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{category}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{pct}%</span>
          <span className="text-sm font-semibold text-gray-900">{amount.toLocaleString()} ETB</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: 'var(--cbe)' }}
        />
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchInsight = async (p) => {
    setLoading(true);
    setNotFound(false);
    setInsight(null);
    try {
      const { data } = await api.get(`/insights/${p}`);
      setInsight(data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsight(period); }, []);

  const handlePeriod = p => {
    setPeriod(p);
    fetchInsight(p);
  };

  const breakdown = insight?.breakdown ?? {};
  const breakdownEntries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const totalOut = insight?.totalOut ?? 0;
  const net = (insight?.totalIn ?? 0) - totalOut;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-gray-400 text-sm mt-0.5">Monthly spending overview</p>
        </div>
        <PeriodSelector period={period} onChange={handlePeriod} />
      </div>

      {loading ? (
        <Spinner />
      ) : notFound || !insight ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900">No insight for this period</p>
          <p className="text-xs text-gray-400 mt-1">Insights are computed automatically when transactions arrive.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              label="Money In"
              value={`${(insight.totalIn).toLocaleString()} ETB`}
              color="#22c55e"
              icon={<path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
            />
            <SummaryCard
              label="Money Out"
              value={`${insight.totalOut.toLocaleString()} ETB`}
              color="#ef4444"
              icon={<path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />}
            />
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--cbe-muted)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="var(--cbe)" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Net</p>
              </div>
              <p className={`text-2xl font-bold ${net >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {net >= 0 ? '+' : ''}{net.toLocaleString()} ETB
              </p>
            </div>
          </div>

          {/* Top category banner */}
          {insight.topCategory && (
            <div className="rounded-2xl px-6 py-4 mb-6 flex items-center gap-4" style={{ backgroundColor: 'var(--cbe-muted)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--cbe)' }}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Top spending category</p>
                <p className="text-base font-bold text-gray-900">{insight.topCategory}</p>
              </div>
            </div>
          )}

          {/* Spending breakdown */}
          {breakdownEntries.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-6">Spending Breakdown</h2>
              <div className="space-y-5">
                {breakdownEntries.map(([cat, amt]) => (
                  <BreakdownBar key={cat} category={cat} amount={amt} total={totalOut} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
