import { useState } from 'react';

import api from '../../services/api';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Education', 'Other'];

function genExternalId() {
  return 'CBE' + Date.now() + Math.floor(Math.random() * 10000);
}

export default function SimulatePage() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [direction, setDirection] = useState('OUT');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('Other');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAmount = val => {
    if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount.');
    if (!phone.trim()) return setError('Enter your phone number.');

    setLoading(true);
    setError('');
    try {
      await api.post('/webhooks/transaction', {
        externalId: genExternalId(),
        phone: phone.replace(/^0/, ''),
        amount: parseFloat(amount),
        direction,
        reason,
        category,
        happenedAt: new Date().toISOString(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--cbe)' }}>
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="var(--cbe)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Transaction Successful</h2>
        <p className="text-white/60 text-sm mb-2">{direction === 'OUT' ? 'Payment sent' : 'Payment received'}</p>
        <p className="text-4xl font-bold text-white mb-8">ETB {parseFloat(amount).toLocaleString()}</p>
        <button
          onClick={() => { setSuccess(false); setAmount(''); setReason(''); setPhone(''); }}
          className="px-8 py-3.5 bg-white/20 text-white font-semibold rounded-2xl text-sm"
        >
          New Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white max-w-md mx-auto">

      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ backgroundColor: 'var(--cbe)' }}>
        <h1 className="text-white font-bold text-lg">CBE Transaction</h1>
        <p className="text-white/60 text-xs mt-0.5">Commercial Bank of Ethiopia</p>
      </div>

      {/* Direction tabs */}
      <div className="flex px-5 gap-3 pt-4">
        {['OUT', 'IN'].map(d => (
          <button
            key={d}
            onClick={() => { setDirection(d); setError(''); }}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all"
            style={direction === d
              ? { backgroundColor: 'var(--cbe)', color: 'white', borderColor: 'var(--cbe)' }
              : { backgroundColor: 'white', color: '#9ca3af', borderColor: '#f3f4f6' }
            }
          >
            {d === 'OUT' ? '↑ Send' : '↓ Receive'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="flex flex-col items-center px-5 pt-10 pb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Amount</p>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-400">ETB</span>
          <input
            type="text" inputMode="decimal"
            value={amount} onChange={e => handleAmount(e.target.value)}
            placeholder="0.00"
            className="text-5xl font-bold text-gray-900 outline-none text-center bg-transparent w-48 placeholder-gray-200"
          />
        </div>
        <div className="h-px w-48 mt-4" style={{ backgroundColor: amount ? 'var(--cbe)' : '#e5e7eb' }} />
      </div>

      {/* Fields */}
      <div className="flex-1 px-5 space-y-6">

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Phone number</label>
          <div className="flex items-center border-b border-gray-200 pb-3 focus-within:border-[var(--cbe)] transition-colors">
            <span className="text-sm text-gray-400 mr-2 shrink-0">+251</span>
            <input
              type="tel" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="911 234 567" maxLength={9} spellCheck={false}
              className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-300 bg-transparent"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-2">Description</label>
          <input
            type="text" value={reason} onChange={e => { setReason(e.target.value); setError(''); }}
            placeholder="What is this transaction for? (optional)"
            spellCheck={false}
            className="w-full border-b border-gray-200 pb-3 text-sm text-gray-900 outline-none placeholder-gray-300 bg-transparent focus:border-[var(--cbe)] transition-colors"
          />
        </div>

        {/* Category pills */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c} type="button"
                onClick={() => setCategory(c)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={category === c
                  ? { backgroundColor: 'var(--cbe)', color: 'white' }
                  : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}
      </div>

      {/* Submit */}
      <div className="px-5 pb-10 pt-6">
        <button
          onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-50 transition-all"
          style={{ backgroundColor: 'var(--cbe)', boxShadow: '0 6px 20px rgba(192,64,190,0.35)' }}
          onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--cbe-dark)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--cbe)')}
        >
          {loading ? 'Processing...' : direction === 'OUT' ? 'Send Payment' : 'Receive Payment'}
        </button>
      </div>

    </div>
  );
}
