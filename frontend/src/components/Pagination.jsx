import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage <= 2) end = Math.min(totalPages - 1, 4);
    if (currentPage >= totalPages - 1) start = Math.max(2, totalPages - 3);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
      >
        Prev
      </button>

      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="px-2 text-gray-400 font-bold">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all duration-200 ${
                  currentPage === page
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105"
                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;