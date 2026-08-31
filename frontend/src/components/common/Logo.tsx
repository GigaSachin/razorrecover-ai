export const RazorRecoverLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <svg
    viewBox="0 0 40 40"
    width={size}
    height={size}
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Modern fintech arrow/lightning bolt */}
    <defs>
      <linearGradient id="razorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    {/* Main arrow shape - pointing up and to the right */}
    <path
      d="M 20 2 L 28 18 L 22 18 L 28 32 L 12 20 L 18 20 Z"
      fill="url(#razorGradient)"
    />

    {/* Accent curve */}
    <path
      d="M 8 28 Q 10 24 12 20"
      stroke="#3b82f6"
      strokeWidth="1.5"
      opacity="0.4"
    />
  </svg>
)
