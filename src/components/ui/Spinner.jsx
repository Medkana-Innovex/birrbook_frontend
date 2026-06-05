export default function Spinner({ className = 'h-48' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin"
        style={{ borderTopColor: 'var(--cbe)' }}
      />
    </div>
  );
}
