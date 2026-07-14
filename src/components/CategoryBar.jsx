export default function CategoryBar({ categories, active, onSelect }) {
  return (
    <div className="sticky top-[73px] z-40 border-b border-border-light bg-bg-main/95 backdrop-blur-sm sm:top-[81px]">
      <div className="container-site">
        <div className="no-scrollbar flex gap-2 overflow-x-auto py-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`flex-shrink-0 rounded-full px-5 py-2 text-[0.9rem] font-medium transition-colors duration-200 ${
                active === cat.id
                  ? 'bg-rose text-white'
                  : 'bg-bg-alt text-text-secondary hover:bg-rose/15 hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
