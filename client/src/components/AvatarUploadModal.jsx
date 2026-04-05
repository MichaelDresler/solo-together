import { useEffect, useRef, useState } from "react";
import ImageUploadDropzone from "./ImageUploadDropzone";

export default function AvatarUploadModal({
  currentAvatarUrl = "",
  selectedFile,
  previewUrl,
  uploading = false,
  error = "",
  onClose,
  onFileChange,
  onSubmit,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const previewImageUrl = previewUrl || currentAvatarUrl;

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !uploading) {
        onClose();
      }
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, uploading]);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files?.[0] || null);
  }

  function handleInputChange(event) {
    onFileChange(event.target.files?.[0] || null);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      aria-hidden="false"
    >
      <button
        type="button"
        aria-label="Close avatar upload"
        onClick={() => {
          if (!uploading) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-stone-950/30 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload profile photo"
        className="relative z-10 w-full max-w-2xl overflow-hidden squircle rounded-[1.75rem]  bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]"
      >
        <form onSubmit={onSubmit} className="space-y-6 p-6 sm:p-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              Upload a new avatar
            </h2>
            <p className="text-sm text-stone-600">
              Choose a clear image that still looks good cropped into a circle.
            </p>
          </div>

          <ImageUploadDropzone
            inputRef={inputRef}
            previewImageUrl={previewImageUrl}
            isDragging={isDragging}
            onOpen={() => inputRef.current?.click()}
            onKeyDown={handleKeyDown}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onInputChange={handleInputChange}
            previewAlt="Avatar preview"
            previewHint="Click or drop a new image here to replace your current photo."
            emptyHint="PNG, JPG, GIF, or WEBP"
            className="p-5"
          />

          {selectedFile && (
            <p className="text-sm text-stone-500">
              Selected file:{" "}
              <span className="font-medium text-stone-700">{selectedFile.name}</span>
            </p>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="inline-flex h-11 items-center justify-center squircle rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex squircle h-11 items-center justify-center rounded-full bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
