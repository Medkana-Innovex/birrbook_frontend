import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAdminCredentials } from '../../store/slices/adminSlice';
import api from '../../services/api';
import EyeIcon from '../../components/ui/EyeIcon';

const focusStyle = e => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--cbe)');
const blurStyle  = e => (e.currentTarget.style.boxShadow = 'none');

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      dispatch(setAdminCredentials({ accessToken: data.accessToken }));
      navigate('/admin/users');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--cbe)' }}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in with your admin credentials</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Phone number</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden transition-all" onFocusCapture={focusStyle} onBlurCapture={blurStyle}>
                <div className="flex items-center px-3 bg-gray-50 border-r border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">+251</span>
                </div>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="911 000 000" spellCheck={false} autoComplete="tel" required
                  className="flex-1 px-4 py-3 text-sm text-gray-900 outline-none placeholder-gray-300 bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden transition-all" onFocusCapture={focusStyle} onBlurCapture={blurStyle}>
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" spellCheck={false} autoComplete="current-password" required
                  className="flex-1 px-4 py-3 text-sm text-gray-900 outline-none placeholder-gray-300 bg-white"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-gray-400 hover:text-gray-600 bg-white">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all"
              style={{ backgroundColor: 'var(--cbe)', boxShadow: '0 4px 14px rgba(192,64,190,0.3)' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--cbe-dark)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--cbe)')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
