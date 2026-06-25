export function TelegramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.94 4.34 18.6 19.1c-.25 1.1-.91 1.37-1.84.85l-5.08-3.74-2.45 2.36c-.27.27-.5.5-1.02.5l.36-5.16 9.4-8.49c.4-.36-.09-.56-.63-.2L5.1 12.06l-5-1.57c-1.09-.34-1.11-1.09.23-1.61l19.55-7.54c.9-.33 1.7.2 1.4 1z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
