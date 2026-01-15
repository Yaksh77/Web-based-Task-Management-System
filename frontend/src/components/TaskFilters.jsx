import React, { use, useEffect, useState } from "react";
import { LuSearch, LuArrowUpDown } from "react-icons/lu";

function TaskFilters({ filters, setFilters, setSearchTerm }) {
  const [search, setSearch] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearchTerm(search);
    }, 500);

    return () => clearTimeout(debounce);
  },[search, setSearchTerm]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
      {/* Search */}
      <div className="flex-1 min-w-50 relative">
        <LuSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          name="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Search title or project..."
        />
      </div>

      {/* Status */}
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
      >
        <option value="ALL">All Status</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_TESTING">In Testing</option>
        <option value="COMPLETED">Completed</option>
        <option value="OVERDUE">Overdue</option>
      </select>

      {/* Priority */}
      <select
        name="priority"
        value={filters.priority}
        onChange={handleChange}
        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
      >
        <option value="ALL">All Priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      {/* Sort By */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
        <LuArrowUpDown size={14} className="text-gray-400" />
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleChange}
          className="bg-transparent text-sm outline-none"
        >
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
        </select>
      </div>

      {/* Sort Order */}
      <select
        name="sortOrder"
        value={filters.sortOrder}
        onChange={handleChange}
        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none font-bold text-blue-600"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}

export default TaskFilters;
