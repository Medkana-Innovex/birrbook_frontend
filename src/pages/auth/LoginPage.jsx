import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../services/api';
import EyeIcon from '../../components/ui/EyeIcon';

const focusStyle = e => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--cbe)');
const blurStyle  = e => (e.currentTarget.style.boxShadow = 'none');

export default function LoginPage() {
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
      const { data } = await api.post('/auth/login', form);
      dispatch(setCredentials({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left — CBE purple panel (hidden on mobile) */}
      <div className="hidden lg:flex w-2/5 flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--cbe)' }}>
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-y-1/2 -translate-x-1/2 opacity-10 bg-white" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full translate-y-1/2 translate-x-1/2 opacity-10 bg-white" />

        <div className="relative text-center px-10">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur">
            <span className="text-white text-4xl font-bold">B</span>
          </div>
          <h3 className="text-3xl font-bold text-white leading-snug mb-4">
            Welcome<br />back.
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Sign in to continue tracking your finances with Birrbook.
          </p>
        </div>
      </div>

      {/* Right — form (white) */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--cbe)' }}>
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-gray-900">Birrbook</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Phone number</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden transition-all" onFocusCapture={focusStyle} onBlurCapture={blurStyle}>
                <div className="flex items-center px-3 bg-gray-50 border-r border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">+251</span>
                </div>
                <input
                  type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="911 234 567" spellCheck={false} autoComplete="tel" maxLength={9} required
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

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--cbe)' }}>Register</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
