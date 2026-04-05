import { useId } from "react";

export default function ImageUploadDropzone({
  inputRef,
  previewImageUrl = "",
  isDragging = false,
  onInputChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onKeyDown,
  onOpen,
  emptyTitle = "Drop an image here or click to upload",
  emptyHint = "PNG, JPG, WEBP up to 5MB",
  previewHint = "Click or drop a new image here to replace the current image.",
  previewAlt = "Image preview",
  className = "",
}) {
  const inputId = useId();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`cursor-pointer rounded-2xl border border-dashed p-6 transition ${
        isDragging
          ? "border-black/50 bg-black/10"
          : "border-black/10 bg-black/5 hover:border-black/40"
      } ${className}`}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {previewImageUrl ? (
        <div className="space-y-4">
          <img
            src={previewImageUrl}
            alt={previewAlt}
            className="h-80 w-full rounded-xl object-cover"
          />
          <p className="text-sm text-stone-600">{previewHint}</p>
        </div>
      ) : (
        <div className="space-y-2 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="black"
            className="mx-auto mb-4 size-8 opacity-40"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>

          <p className="text-sm font-medium text-stone-700">{emptyTitle}</p>
          <p className="text-xs text-stone-500">{emptyHint}</p>
        </div>
      )}
    </div>
  );
}
