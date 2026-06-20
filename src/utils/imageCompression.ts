// Client-side image downscaling/compression before upload.
// Cuts upload payload ~5-10x while keeping enough detail for face recognition.

const MAX_DIMENSION = 2560; // long edge in px
const JPEG_QUALITY = 0.85;
const THUMB_MAX_DIM = 1200;
const THUMB_QUALITY = 0.80;

/**
 * Decode the image once, render to two canvas sizes, return both encoded blobs.
 * The thumbnail (≤1200px) replaces the GPU-side resize that was previously done in Modal.
 */
export async function compressAndThumbnail(
    file: File,
    maxDimension = MAX_DIMENSION,
    thumbMaxDim = THUMB_MAX_DIM,
    quality = JPEG_QUALITY,
    thumbQuality = THUMB_QUALITY,
): Promise<{ compressed: File; thumbnail: Blob }> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        return { compressed: file, thumbnail: file };
    }
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const { width, height } = bitmap;
        const maxDim = Math.max(width, height);

        const scale = Math.min(1, maxDimension / maxDim);
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);

        const thumbScale = Math.min(1, thumbMaxDim / maxDim);
        const thumbW = Math.round(width * thumbScale);
        const thumbH = Math.round(height * thumbScale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbW;
        thumbCanvas.height = thumbH;
        const thumbCtx = thumbCanvas.getContext('2d');

        if (!ctx || !thumbCtx) {
            bitmap.close?.();
            return { compressed: file, thumbnail: file };
        }

        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        thumbCtx.drawImage(bitmap, 0, 0, thumbW, thumbH);
        bitmap.close?.();

        const [compressedBlob, thumbnailBlob] = await Promise.all([
            new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', quality)),
            new Promise<Blob | null>(r => thumbCanvas.toBlob(r, 'image/jpeg', thumbQuality)),
        ]);

        const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        const compressed = (!compressedBlob || compressedBlob.size >= file.size)
            ? file
            : new File([compressedBlob], newName, { type: 'image/jpeg', lastModified: file.lastModified });

        const thumbnail: Blob = thumbnailBlob ?? compressedBlob ?? file;
        return { compressed, thumbnail };
    } catch {
        return { compressed: file, thumbnail: file };
    }
}

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
