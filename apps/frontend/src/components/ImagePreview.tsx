import { useRef, useState, useCallback } from "react";

interface Props {
  original: string;
  result: string | null;
}

export const ImagePreview: React.FC<Props> = ({ original, result }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) {
      return;
    }

    const { left, width } = containerRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updatePosition(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging.current) updatePosition(e.clientX);
  };
  const onMouseUp = () => {
    dragging.current = false;
  };
  const onTouchMove = (e: React.TouchEvent) =>
    updatePosition(e.touches[0].clientX);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 rounded-xl overflow-hidden select-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      <img
        src={original}
        alt="original"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {result && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <img
            src={result}
            alt="upscaled"
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {result && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M5 4L2 8L5 12M11 4L14 8L11 12"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
