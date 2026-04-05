import { useEffect } from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, isOpen, onCancel]);

  const confirmClassName =
    confirmTone === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
      : "bg-stone-900 text-white hover:bg-stone-700 disabled:bg-stone-300";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-8 transition-opacity duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={() => {
          if (!busy) {
            onCancel();
          }
        }}
        className={`absolute inset-0 transition-opacity duration-200 ${
          isOpen ? "bg-stone-950/30" : "bg-stone-950/0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 w-full squircle max-w-md overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] transition-all duration-200 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="space-y-3 p-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
            <p className="text-sm leading-6 text-stone-600">{message}</p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="inline-flex h-11 items-center squircle justify-center rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`inline-flex h-11 items-center squircle justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed ${confirmClassName}`}
            >
              {busy ? "Working..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
