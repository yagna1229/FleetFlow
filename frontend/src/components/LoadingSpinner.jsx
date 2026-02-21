/**
 * LoadingSpinner — centered spinner for loading states.
 */
import '../css/shared.css'

export default function LoadingSpinner() {
    return (
        <div className="centerWrap">
            <div className="spinner" aria-label="Loading" />
        </div>
    )
}
