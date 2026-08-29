import { SlidersHorizontal, X } from "lucide-react";
import SearchBar from "./SearchBar";

export default function FilterBar({ searchValue, onSearch, children, searchPlaceholder }) {
  return (
    <div className="filter-bar">
      {onSearch && (
        <SearchBar
          value={searchValue || ""}
          onChange={onSearch}
          placeholder={searchPlaceholder || "Search..."}
          style={{ minWidth: 220 }}
        />
      )}
      {children}
      <div style={{ marginLeft: "auto" }} className="flex gap-8">
        <span className="flex gap-8 muted text-sm" style={{ alignItems: "center" }}>
          <SlidersHorizontal size={14} />
          Filters
        </span>
      </div>
    </div>
  );
}
