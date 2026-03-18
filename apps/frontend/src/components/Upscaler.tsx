import { useState, useRef, useCallback } from "react";
import { uploadImage } from "../api/api";
import { useJobSocket, type JobUpdate } from "../hooks/useJobSocket";

interface ImageInfo {
  src: string;
  name: string;
  width: number;
  height: number;
  size: string;
}

interface ScaleOption {
  label: string;
  value: number;
}

const SCALE_OPTIONS: ScaleOption[] = [
  { label: "2x", value: 2 },
  { label: "4x", value: 4 },
];

export default function Upscaler() {
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useJobSocket(jobId, (update: JobUpdate) => {
    if (update.status === "done" && update.resultUrl) {
      setResultUrl(update.resultUrl);
      setIsLoading(false);
      setJobId(null);
    } else if (update.status === "failed") {
      setError(update.errorMessage ?? "Processing failed");
      setIsLoading(false);
      setJobId(null);
    }
  });

  const loadImageFile = (f: File | undefined): void => {
    if (!f) {
      return;
    }
    setFile(f);
    setResultUrl(null);
    setError(null);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setImage({
        src: url,
        name: f.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: (f.size / 1024).toFixed(1),
      });
    };
    img.src = url;
  };

  const handleUpscale = async (): Promise<void> => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      const { jobId: id } = await uploadImage(file, scale);
      setJobId(id);
    } catch {
      setError("Upload failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    loadImageFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    loadImageFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => setIsDragging(false);

  async function downloadFile(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${file?.name.split(".")[0]}_upscaled.png`;
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center px-4 py-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">
          pic-scale
        </h1>
        <p className="text-xs uppercase tracking-widest opacity-50">
          AI image upscaler
        </p>
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg flex flex-col gap-5">
        {/* Upload zone */}
        <div
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none
        ${image ? "min-h-18" : "min-h-50"}
        ${isDragging ? "border-primary bg-primary/5" : "border-base-content/20 hover:border-base-content/40"}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!image ? (
            <>
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-30"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs uppercase tracking-widest opacity-50">
                {isDragging
                  ? "release file"
                  : "click to upload or drag and drop image"}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-3 px-5 py-3 w-full">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40 shrink-0"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-sm truncate flex-1 opacity-60">
                {image.name}
              </span>
              <span className="text-xs uppercase tracking-widest opacity-50 shrink-0">
                change
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Scale + Upscale button */}
        {image && (
          <>
            <div className="flex gap-3">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`btn flex-1 text-base font-bold ${scale === opt.value ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setScale(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary w-full text-base font-bold uppercase tracking-widest"
              onClick={handleUpscale}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  processing...
                </>
              ) : (
                `upscale x${scale}`
              )}
            </button>

            {error && <div className="alert alert-error text-sm">{error}</div>}

            {resultUrl && (
              <button
                onClick={() => downloadFile(resultUrl)}
                className="btn btn-outline w-full uppercase tracking-widest"
              >
                download
              </button>
            )}
          </>
        )}
      </div>

      {image && (
        <div
          className="w-full mt-5 transition-all"
          style={{ maxWidth: resultUrl ? "860px" : "512px" }}
        >
          <div className="flex flex-col items-center gap-3 bg-base-100 rounded-2xl p-4 border border-base-content/10">
            <div className="flex gap-4 w-full h-80">
              <div className="flex-1 flex flex-col gap-2">
                <img
                  src={image.src}
                  alt="original"
                  className="w-full h-full object-contain rounded-xl"
                />
                <span className="text-xs uppercase tracking-widest opacity-40 text-center">
                  original
                </span>
              </div>
              {resultUrl && (
                <div className="flex-1 flex flex-col gap-2">
                  <img
                    src={resultUrl}
                    alt="upscaled"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <span className="text-xs uppercase tracking-widest opacity-40 text-center">
                    upscaled
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4 text-xs uppercase tracking-widest opacity-50">
              <span>
                {image.width} x {image.height}px
              </span>
              <span>·</span>
              <span>{image.size} KB</span>
              <span>·</span>
              <span>
                → {image.width * scale} × {image.height * scale}px
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
