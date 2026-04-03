import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GlobalSearchModal({ isOpen, onClose, initialQuery = "" }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState(() => initialQuery);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimeout = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 20);

    return () => {
      window.clearTimeout(focusTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center px-4 pt-24 transition-opacity duration-200 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "bg-stone-950/20" : "bg-stone-950/0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className={`relative z-10 w-full max-w-2xl overflow-hidden squircle rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] transition-all duration-200 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "-translate-y-2 scale-95 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 border-b border-stone-200 px-5 py-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-5 text-stone-400"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z"
              />
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search concerts, games, or shows"
              className="w-full bg-transparent text-lg font-medium tracking-tight text-stone-950 outline-none placeholder:text-stone-400"
            />

            <button
              type="submit"
              disabled={!query.trim()}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#CF5812] px-4 text-sm font-semibold text-white transition hover:bg-[#b35119] disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              Search
            </button>
          </div>

          <div className="flex items-center justify-between bg-stone-50 px-5 py-3 text-sm text-stone-500">
            <p>Find Ticketmaster events across Canada.</p>
            <p className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-500">
              ESC to close
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
