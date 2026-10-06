export function Rating({ value, className = "" }: { value: number; className?: string }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold text-ink ${className}`} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
        <path fill="#e3b23c" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
      </svg>
      {value.toFixed(1)}
    </span>
  );
}
