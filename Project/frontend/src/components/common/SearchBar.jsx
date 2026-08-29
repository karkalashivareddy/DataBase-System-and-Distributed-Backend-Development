import { useEffect } from "react";
import { Search, X } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={`search-input-wrap ${className}`}>
      <span className="search-icon" aria-hidden="true">
        <Search size={16} />
      </span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="icon-btn"
          style={{ position: "absolute", right: 6 }}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
