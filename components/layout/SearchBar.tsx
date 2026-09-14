import { Search } from "lucide-react";
import { categories } from "@/data/categories";

export function SearchBar() {
  return (
    <form action="/search" method="get" className="flex flex-1 h-10 rounded-md overflow-hidden">
      <select
        name="category"
        aria-label="Search category"
        defaultValue=""
        className="hidden md:block bg-[#f3f3f3] text-text text-sm px-2 border-r border-border-strong focus:outline-none max-w-[110px] truncate"
      >
        <option value="">All</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="q"
        placeholder="Search Amazon"
        aria-label="Search Amazon"
        className="flex-1 min-w-0 px-3 text-sm text-text placeholder:text-text-secondary bg-white focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="bg-accent hover:bg-[#e88a00] px-4 flex items-center justify-center shrink-0"
      >
        <Search size={20} className="text-text" strokeWidth={2.5} />
      </button>
    </form>
  );
}
