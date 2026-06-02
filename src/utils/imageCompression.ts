// Client-side image downscaling/compression before upload.
// Cuts upload payload ~5-10x while keeping enough detail for face recognition.

const MAX_DIMENSION = 2560; // long edge in px
const JPEG_QUALITY = 0.85;

export async function compressImage(
    file: File,
    maxDimension: number = MAX_DIMENSION,
    quality: number = JPEG_QUALITY
): Promise<File> {
    // Only handle raster images the browser can decode. Skip gif (animation) and
    // anything non-image; fall back to the original on any failure.
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        return file;
    }

    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const { width, height } = bitmap;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            bitmap.close?.();
            return file;
        }
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close?.();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', quality)
        );
        if (!blob || blob.size >= file.size) {
            // Re-encoding didn't help (already small/optimized) — keep original.
            return file;
        }

        const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        return new File([blob], newName, { type: 'image/jpeg', lastModified: file.lastModified });
    } catch {
        return file;
    }
}
