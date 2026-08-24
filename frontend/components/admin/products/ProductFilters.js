"use client";

import { Search } from "lucide-react";

export default function ProductFilters({
  searchTerm,
  setSearchTerm,
  onSearchChange,
  selectedCategory,
  setSelectedCategory,
  onCategoryChange,
  categories = [],
}) {
  const handleSearch = onSearchChange || setSearchTerm;
  const handleCategory = onCategoryChange || setSelectedCategory;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#ECE8DF] p-3 rounded-2xl border border-[#DDD6C8] shadow-xs">
      <div className="relative flex-1 w-full">
        <input
          type="text"
          placeholder="Search products by title or description..."
          value={searchTerm}
          onChange={(e) => handleSearch && handleSearch(e.target.value)}
          className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-3.5 py-2 pl-9 text-xs text-[#2C2A29] placeholder-stone-400 focus:outline-none focus:border-[#1E3A5F] transition shadow-xs"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => handleCategory && handleCategory(e.target.value)}
        className="w-full sm:w-56 bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-3 py-2 text-xs text-[#2C2A29] focus:outline-none focus:border-[#1E3A5F] transition cursor-pointer shadow-xs"
      >
        <option value="all">All Categories ({categories.length})</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
