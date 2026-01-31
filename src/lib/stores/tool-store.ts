import { create } from "zustand";

export interface ToolState {
  files: File[];
  results: Blob[];
  resultFilenames: string[];
  isProcessing: boolean;
  progress: number;
  progressText: string;
  error: string | null;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  setProcessing: (processing: boolean) => void;
  setProgress: (progress: number, text?: string) => void;
  setResults: (results: Blob[], filenames: string[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  files: [] as File[],
  results: [] as Blob[],
  resultFilenames: [] as string[],
  isProcessing: false,
  progress: 0,
  progressText: "",
  error: null as string | null,
};

export const createToolStore = () =>
  create<ToolState>((set) => ({
    ...initialState,

    addFiles: (newFiles) =>
      set((state) => ({ files: [...state.files, ...newFiles] })),

    removeFile: (index) =>
      set((state) => ({
        files: state.files.filter((_, i) => i !== index),
      })),

    clearFiles: () => set({ files: [] }),

    setProcessing: (processing) =>
      set({
        isProcessing: processing,
        ...(processing ? { error: null } : {}),
      }),

    setProgress: (progress, text) =>
      set({
        progress: Math.min(100, Math.max(0, progress)),
        ...(text !== undefined ? { progressText: text } : {}),
      }),

    setResults: (results, filenames) =>
      set({
        results,
        resultFilenames: filenames,
        isProcessing: false,
        progress: 100,
      }),

    setError: (error) =>
      set({ error, isProcessing: false }),

    reset: () => set({ ...initialState }),
  }));

export const useToolStore = createToolStore();
