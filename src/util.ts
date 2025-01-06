export const toHumanReadableStorageSize = (n: number): string => (n < 1024
    ? `${n}\u00A0Bytes`
    : n < 1024 * 1024
        ? `${(n / 1024).toFixed(2)}\u00A0KB`
        : n < 1024 * 1024 * 1024
            ? `${(n / (1024 * 1024)).toFixed(2)}\u00A0MB`
            : `${(n / (1024 * 1024 * 1024)).toFixed(2)}\u00A0GB`
)
