export interface FileValidateOpts {
  minKB?: number;
  maxKB?: number;
  mimes?: string[];
  minWidth?: number;
  minHeight?: number;
}

export interface FileValidateResult {
  ok: boolean;
  error?: string;
}

const readImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });

export async function validateFile(file: File, opts: FileValidateOpts = {}): Promise<FileValidateResult> {
  const { minKB, maxKB, mimes, minWidth, minHeight } = opts;
  const sizeKB = file.size / 1024;

  if (mimes && mimes.length > 0 && !mimes.includes(file.type)) {
    return { ok: false, error: `Invalid file type. Expected: ${mimes.map((m) => m.split("/")[1]).join(", ")}` };
  }
  if (minKB != null && sizeKB < minKB) {
    return { ok: false, error: `File too small (${Math.round(sizeKB)} KB). Minimum ${minKB} KB.` };
  }
  if (maxKB != null && sizeKB > maxKB) {
    return { ok: false, error: `File too large (${Math.round(sizeKB / 1024)} MB). Maximum ${Math.round(maxKB / 1024)} MB.` };
  }
  if ((minWidth != null || minHeight != null) && file.type.startsWith("image/")) {
    try {
      const { width, height } = await readImageDimensions(file);
      if (minWidth != null && width < minWidth) {
        return { ok: false, error: `Image too narrow (${width}px). Minimum ${minWidth}px wide.` };
      }
      if (minHeight != null && height < minHeight) {
        return { ok: false, error: `Image too short (${height}px). Minimum ${minHeight}px tall.` };
      }
    } catch {
      return { ok: false, error: "Could not read image dimensions." };
    }
  }

  return { ok: true };
}

export const PHOTO_OPTS: FileValidateOpts = {
  minKB: 50,
  maxKB: 4 * 1024,
  mimes: ["image/jpeg", "image/png"],
  minWidth: 300,
  minHeight: 400,
};

export const DOC_OPTS: FileValidateOpts = {
  minKB: 50,
  maxKB: 8 * 1024,
  mimes: ["image/jpeg", "image/png", "application/pdf"],
};
