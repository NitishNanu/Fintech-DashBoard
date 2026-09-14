function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", isDanger = false, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-container confirm-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <div className={`confirm-circle ${isDanger ? "circle-danger" : "circle-warning"}`}>
            {isDanger ? "⚠️" : "❓"}
          </div>
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={isDanger ? "btn-danger" : "btn-primary"}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
