import { useState, useCallback } from 'react';

export const useClipboard = () => {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const copyToClipboard = useCallback(async (text: string) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } catch (err) {
                    throw new Error('Fallback copy failed');
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to copy'));
            console.error('Failed to copy:', err);
        }
    }, []);

    return { copyToClipboard, copied, error };
};
