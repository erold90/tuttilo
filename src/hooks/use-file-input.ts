import { useRef, useCallback } from "react";

/**
 * Reliable file input hook using a persistent hidden <input> element.
 * Replaces the fragile `document.createElement("input")` pattern that fails
 * on first click in Safari and React 19 concurrent mode.
 *
 * Usage:
 *   const { ref, open, inputProps } = useFileInput({ accept: "video/*", onFile: loadFile });
 *   // In JSX: <input {...inputProps} />
 *   // On click: onClick={open}
 */
export function useFileInput(opts: {
  accept: string;
  onFile: (file: File) => void;
  multiple?: boolean;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const onFileRef = useRef(opts.onFile);
  onFileRef.current = opts.onFile;

  const open = useCallback(() => {
    if (ref.current) {
      ref.current.value = "";
      ref.current.click();
    }
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (opts.multiple) {
      Array.from(files).forEach((f) => onFileRef.current(f));
    } else if (files[0]) {
      onFileRef.current(files[0]);
    }
  }, [opts.multiple]);

  return {
    ref,
    open,
    inputProps: {
      ref,
      type: "file" as const,
      accept: opts.accept,
      multiple: opts.multiple ?? false,
      className: "hidden" as const,
      onChange,
    },
  };
}
