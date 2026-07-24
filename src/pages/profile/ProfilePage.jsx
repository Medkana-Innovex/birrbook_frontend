import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import AppLayout from '../../components/layout/AppLayout';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <AppLayout>
      <div className="max-w-md mx-auto">

        {/* Avatar */}
        <div className="flex flex-col items-center py-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
            style={{ backgroundColor: 'var(--cbe)' }}
          >
            {initials}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{user?.name ?? '—'}</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.phone ?? '—'}</p>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 mb-4">
          <InfoRow label={t('profile.fullName')} value={user?.name} />
          <InfoRow label={t('profile.phone')} value={user?.phone} />
          <InfoRow label={t('profile.email')} value={user?.email} />
          <InfoRow label={t('profile.memberSince')} value={user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            : null}
          />
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl text-red-500 font-semibold text-sm bg-red-50 hover:bg-red-100 transition-all"
        >
          {t('profile.signOut')}
        </button>

      </div>
    </AppLayout>
  );
}
