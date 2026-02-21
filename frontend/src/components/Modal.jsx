/**
 * Modal — reusable overlay dialog.
 */
import "../css/shared.css";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalPanel" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3 className="modalTitle">{title}</h3>
          <button className="modalClose" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
