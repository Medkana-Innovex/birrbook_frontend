import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogout } from '../../store/slices/adminSlice';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function UserRow({ user }) {
  const [open, setOpen] = useState(false);
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const joined = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 py-4 px-6 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--cbe)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-400">{user.phone}</p>
        </div>
        <div className="text-right shrink-0 mr-2">
          <p className="text-xs text-gray-400">{user.stats.totalTransactions} txns</p>
          <p className="text-xs text-gray-400">{joined}</p>
        </div>
        <svg
          className="w-4 h-4 text-gray-300 shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-5 pt-1 bg-gray-50 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Detail label="Full name" value={user.name} />
          <Detail label="Phone" value={user.phone} />
          <Detail label="Email" value={user.email || '—'} />
          <Detail label="Joined" value={joined} />
          <Detail label="Transactions" value={user.stats.totalTransactions} />
          <Detail label="User ID" value={user.id.slice(0, 8) + '…'} mono />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-gray-800 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-5">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)}
          className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
          style={p === page ? { backgroundColor: 'var(--cbe)', color: 'white' } : { border: '1px solid #e5e7eb', color: '#6b7280' }}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function AdminUsersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async (p = 1) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const { data } = await api.get(`/admin/users?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(data.data ?? []);
      setMeta({ total: data.total, totalPages: data.totalPages });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handlePage = p => { setPage(p); fetchUsers(p); };

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalTxns = users.reduce((s, u) => s + u.stats.totalTransactions, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--cbe)' }}>
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Birrbook</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--cbe)' }}>Admin</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-400 text-sm mt-0.5">{meta.total} registered users</p>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard label="Total Users" value={meta.total} sub="all time registrations" />
              <StatCard label="Total Transactions" value={totalTxns} sub="across all users" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-gray-900 shrink-0">All Users</h2>
                <div className="relative w-full max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, phone or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 text-gray-700 placeholder-gray-300"
                    style={{ '--tw-ring-color': 'var(--cbe)' }}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 py-10 text-center">
                  {search ? 'No users match your search' : 'No users yet'}
                </p>
              ) : (
                filtered.map(u => <UserRow key={u.id} user={u} />)
              )}

              {!search && users.length > 0 && (
                <div className="px-6 pb-6">
                  <Pagination page={page} totalPages={meta.totalPages} onPage={handlePage} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
