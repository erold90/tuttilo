"use client";

import { useState, useCallback, useRef } from "react";
import { revokeUrls } from "@/lib/image-utils";

export type BatchFileStatus = "pending" | "processing" | "done" | "error";

export interface BatchFile {
  id: string;
  file: File;
  status: BatchFileStatus;
  resultUrl: string;
  resultBlob: Blob | null;
  resultSize: number;
  error: string;
}

interface UseBatchImageOpts {
  processFile: (file: File) => Promise<{ blob: Blob; url: string }>;
}

export function useBatchImage({ processFile }: UseBatchImageOpts) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const abortRef = useRef(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const entries: BatchFile[] = newFiles.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      file: f,
      status: "pending" as const,
      resultUrl: "",
      resultBlob: null,
      resultSize: 0,
      error: "",
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.resultUrl) revokeUrls(item.resultUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const processAll = useCallback(async () => {
    setProcessing(true);
    abortRef.current = false;

    const pending = files.filter((f) => f.status === "pending" || f.status === "error");
    let completed = 0;

    for (const item of pending) {
      if (abortRef.current) break;

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "processing" as const } : f))
      );

      try {
        const { blob, url } = await processFile(item.file);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "done" as const, resultUrl: url, resultBlob: blob, resultSize: blob.size }
              : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "error" as const, error: "Conversion failed" }
              : f
          )
        );
      }

      completed++;
      setTotalProgress(Math.round((completed / pending.length) * 100));
    }

    setProcessing(false);
  }, [files, processFile]);

  const reset = useCallback(() => {
    abortRef.current = true;
    for (const f of files) {
      revokeUrls(f.resultUrl);
    }
    setFiles([]);
    setProcessing(false);
    setTotalProgress(0);
  }, [files]);

  const allDone = files.length > 0 && files.every((f) => f.status === "done" || f.status === "error");
  const doneCount = files.filter((f) => f.status === "done").length;

  return {
    files,
    processing,
    totalProgress,
    allDone,
    doneCount,
    addFiles,
    removeFile,
    processAll,
    reset,
  };
}
