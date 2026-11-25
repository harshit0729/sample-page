export default function Logo({ className = 'h-8 w-8', tone = 'dark' }) {
  const background = tone === 'dark' ? '#0a1a29' : '#f6f6f1'
  const foreground = tone === 'dark' ? '#f6f6f1' : '#0a1a29'

  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="FileSure"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="7" fill={background} />
      <path d="M9 8.5h9.5L23 13v10.5H9V8.5Z" stroke={foreground} strokeWidth="1.6" />
      <path d="M18.25 8.75V13.1H22.7" stroke={foreground} strokeWidth="1.4" />
      <path
        d="M12.4 17.1l2.05 2.05 4.6-4.6"
        stroke="#6f9bff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
