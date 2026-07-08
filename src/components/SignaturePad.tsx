import { useEffect, useRef, useState, ChangeEvent } from "react";

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  width?: number;
  height?: number;
}

export default function SignaturePad({ value, onChange, width = 480, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<"draw" | "upload">(value?.startsWith("data:image") && !value.includes("base64,uploaded") ? "draw" : "draw");
  const [uploadedName, setUploadedName] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#0F0F0F";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [width, height]);

  const getPoint = (e: PointerEvent | React.PointerEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = getPoint(e);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d");
    if (!ctx) return;
    const p = getPoint(e);
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    lastPoint.current = p;
  };

  const endDraw = () => {
    drawing.current = false;
    lastPoint.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    onChange(null);
    setUploadedName(null);
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onChange(result);
        setUploadedName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setMode("draw")}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            border: `1.5px solid ${mode === "draw" ? "var(--blue)" : "var(--border)"}`,
            background: mode === "draw" ? "var(--blue-lt)" : "var(--white)",
            color: mode === "draw" ? "var(--blue)" : "var(--muted)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ✍ Draw
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            border: `1.5px solid ${mode === "upload" ? "var(--blue)" : "var(--border)"}`,
            background: mode === "upload" ? "var(--blue-lt)" : "var(--white)",
            color: mode === "upload" ? "var(--blue)" : "var(--muted)",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          📤 Upload
        </button>
      </div>

      {mode === "draw" && (
        <div>
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            onPointerCancel={endDraw}
            style={{
              border: "1.5px dashed var(--border)",
              borderRadius: 6,
              background: "#ffffff",
              touchAction: "none",
              display: "block",
              cursor: "crosshair",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={clear}
              style={{
                padding: "6px 12px",
                fontSize: 11,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
            {value && !uploadedName && (
              <span style={{ fontSize: 11, color: "var(--muted)", padding: "6px 0" }}>Signature captured</span>
            )}
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div>
          <div style={{ border: "1.5px dashed var(--border)", borderRadius: 6, padding: 16, background: "var(--bg)" }}>
            <input type="file" accept="image/*" onChange={handleUpload} />
            {uploadedName && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                Uploaded: {uploadedName}
              </div>
            )}
            {value?.startsWith("data:image") && (
              <div style={{ marginTop: 8 }}>
                <img src={value} alt="Signature preview" style={{ maxHeight: 80, maxWidth: "100%", border: "1px solid var(--border)", borderRadius: 4 }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
