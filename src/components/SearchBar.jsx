export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Busque por um produto"
        aria-label="Buscar produto"
        className="w-full rounded-full border border-border-light bg-bg-main py-2.5 pl-10 pr-4 text-[0.9rem] text-text-primary placeholder:text-text-secondary focus:border-rose focus:outline-none"
      />
    </div>
  );
}
