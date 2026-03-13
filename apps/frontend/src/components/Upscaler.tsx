import { useState, useRef, useCallback } from "react";

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
  { label: "8x", value: 8 },
];

export default function Upscaler() {
  const [image, setImage] = useState<ImageInfo | null>(null);
  const [scale, setScale] = useState<number>(2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImageFile = (file: File | undefined): void => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage({
        src: url,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: (file.size / 1024).toFixed(1),
      });
    };
    img.src = url;
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

  const handleUpscale = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: replace with real backend call
      // const formData = new FormData();
      // formData.append("image", file);
      // formData.append("scale", String(scale));
      // const res = await fetch("/api/upscale", { method: "POST", body: formData });
      await new Promise<void>((r) => setTimeout(r, 1800)); // mock delay
      alert(`Upscale x${scale} — backend request`);
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Preview */}
        {image && (
          <div className="flex flex-col items-center gap-3 bg-base-100 rounded-2xl p-4 border border-base-content/10">
            <img
              src={image.src}
              alt="preview"
              className="max-h-95 w-full object-contain rounded-xl"
            />
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
        )}

        {/* Scale buttons + Upscale */}
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
                `upscale ×${scale}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
