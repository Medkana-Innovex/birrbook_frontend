const desktopTaglines = {
  login: { heading: 'Your money,\nyour control.', sub: 'Track every transaction, understand your spending, and grow your savings.' },
  register: { heading: 'Start your\nfinancial journey.', sub: 'Track every transaction, understand your spending, and grow your savings.' },
};

export default function AuthLayout({ page, title, subtitle, children }) {
  const { heading, sub } = desktopTaglines[page] || desktopTaglines.login;

  return (
    <>
      {/* ── MOBILE ── */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Purple header */}
        <div className="flex flex-col items-center justify-center pt-16 pb-10" style={{ backgroundColor: 'var(--cbe)' }}>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <span className="text-2xl font-bold" style={{ color: 'var(--cbe)' }}>B</span>
          </div>
          <h1 className="text-white text-xl font-bold">Birrbook</h1>
          <p className="text-white/60 text-xs mt-1">Personal Finance Tracker</p>
        </div>

        {/* White sheet */}
        <div className="flex-1 -mt-5 bg-white rounded-t-3xl px-6 pt-8 pb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
          <p className="text-gray-400 text-sm mb-7">{subtitle}</p>
          {children}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left — branding */}
        <div className="w-1/2 flex flex-col justify-between p-14 relative overflow-hidden" style={{ backgroundColor: 'var(--cbe)' }}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10 bg-white" />

          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg" style={{ color: 'var(--cbe)' }}>B</span>
            </div>
            <span className="text-white font-bold text-lg">Birrbook</span>
          </div>

          <div className="relative">
            <h2 className="text-5xl font-bold text-white leading-tight mb-5 whitespace-pre-line">{heading}</h2>
            <p className="text-white/70 text-base leading-relaxed max-w-xs">{sub}</p>
          </div>

          <p className="relative text-white/40 text-xs">© 2026 Birrbook</p>
        </div>

        {/* Right — form */}
        <div className="w-1/2 flex items-center justify-center bg-white px-16">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-400 text-sm mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
