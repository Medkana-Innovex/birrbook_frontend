import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import AppLayout from '../../components/layout/AppLayout';
import Spinner from '../../components/ui/Spinner';
import {
  PieChart, Pie, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

const currentPeriod = new Date().toISOString().slice(0, 7);

const COLORS = ['#C040BE', '#3b82f6', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

function TxRow({ tx }) {
  const isIn = tx.direction === 'IN';
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isIn ? 'bg-green-50' : 'bg-red-50'}`}>
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
          {new Date(tx.happenedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <p className={`text-sm font-semibold shrink-0 ${isIn ? 'text-green-600' : 'text-red-500'}`}>
        {isIn ? '+' : '-'}{tx.amount.toLocaleString()} ETB
      </p>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value?.toLocaleString()} ETB</p>
    </div>
  );
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const [transactions, setTransactions] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, txRes, insightRes] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/transactions?limit=50'),
          api.get(`/insights/${currentPeriod}`),
        ]);
        if (meRes.status === 'fulfilled') dispatch(setUser(meRes.value.data));
        if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.data ?? []);
        if (insightRes.status === 'fulfilled') setInsight(insightRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Donut chart data from breakdown
  const pieData = Object.entries(insight?.breakdown ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));

  // In vs Out bar chart
  const inOutData = [
    { name: 'Money In', value: insight?.totalIn ?? 0, fill: '#10b981' },
    { name: 'Money Out', value: insight?.totalOut ?? 0, fill: '#C040BE' },
  ];

  const net = (insight?.totalIn ?? 0) - (insight?.totalOut ?? 0);
  const monthLabel = new Date(currentPeriod).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // Each transaction as signed bar — IN positive, OUT negative
  const txChartData = [...transactions].reverse().map(tx => ({
    label: tx.category ?? 'Other',
    value: tx.amount,
    direction: tx.direction,
  }));

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm">{greeting()},</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{user?.name ?? '—'}</h1>
      </div>

      {loading ? <Spinner className="h-40" /> : (
        <div className="space-y-6">

          {/* Monthly summary numbers */}
          {insight && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'In', value: insight.totalIn, color: 'text-green-600' },
                { label: 'Out', value: insight.totalOut, color: 'text-red-500' },
                { label: 'Net', value: net, color: net >= 0 ? 'text-green-600' : 'text-red-500', sign: true },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                  <p className={`text-lg font-bold ${s.color}`}>
                    {s.sign && s.value >= 0 ? '+' : ''}{s.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-300">ETB</p>
                </div>
              ))}
            </div>
          )}

          {/* Donut + Bar side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pieData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">Spending by Category</p>
                <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" />
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-500">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {txChartData.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-900">In & Out</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">In</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#C040BE' }} />
                      <span className="text-xs text-gray-400">Out</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={txChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const v = payload[0].value;
                        return (
                          <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
                            <p className="text-gray-400">{payload[0].payload.label}</p>
                            <p className="font-bold" style={{ color: payload[0].payload.direction === 'IN' ? '#4ade80' : '#C040BE' }}>
                              {payload[0].payload.direction === 'IN' ? '+' : '-'}{v?.toLocaleString()} ETB
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {txChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.direction === 'IN' ? '#4ade80' : '#C040BE'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900 text-sm">Recent Transactions</h2>
              <Link to="/transactions" className="text-xs font-medium" style={{ color: 'var(--cbe)' }}>
                View all
              </Link>
            </div>
            <div className="px-5">
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-400 py-10 text-center">No transactions yet</p>
              ) : (
                transactions.slice(0, 8).map(tx => <TxRow key={tx.id} tx={tx} />)
              )}
            </div>
          </div>

        </div>
      )}
    </AppLayout>
  );
}
