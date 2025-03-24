import "./pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange, subscribed }) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <nav className="pagination">
      <button
        className={`pagination-nav ${currentPage === 1 ? "disabled" : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {!subscribed && (
        <ul className="pagination-list">
          {getPageNumbers().map((page, index) => (
            <li key={index}>
              {page === "..." ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  type="button"
                  className={`pagination-item ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={`pagination-nav ${
          currentPage === totalPages ? "disabled" : ""
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
