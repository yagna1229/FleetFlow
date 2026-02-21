/**
 * Pagination — page navigation controls.
 */
import '../css/shared.css'

export default function Pagination({ page, totalCount, perPage = 25, onPageChange }) {
    const totalPages = Math.ceil(totalCount / perPage) || 1

    if (totalPages <= 1) return null

    return (
        <div className="paginationWrap">
            <button
                className="secondaryBtn paginationBtn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Prev
            </button>
            <span className="paginationInfo">
                Page {page} of {totalPages}
            </span>
            <button
                className="secondaryBtn paginationBtn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next →
            </button>
        </div>
    )
}
