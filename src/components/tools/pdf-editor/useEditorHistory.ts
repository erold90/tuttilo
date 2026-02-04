import { useCallback, useRef } from "react";
import type { EditorAction } from "./types";

const MAX_HISTORY = 50;

export function useEditorHistory() {
  const undoStack = useRef<EditorAction[]>([]);
  const redoStack = useRef<EditorAction[]>([]);

  const push = useCallback((action: EditorAction) => {
    undoStack.current.push(action);
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
    redoStack.current = [];
  }, []);

  const canUndo = useCallback(() => undoStack.current.length > 0, []);
  const canRedo = useCallback(() => redoStack.current.length > 0, []);

  const undo = useCallback((): EditorAction | null => {
    const action = undoStack.current.pop();
    if (!action) return null;
    redoStack.current.push(action);
    return action;
  }, []);

  const redo = useCallback((): EditorAction | null => {
    const action = redoStack.current.pop();
    if (!action) return null;
    undoStack.current.push(action);
    return action;
  }, []);

  const clear = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
  }, []);

  return { push, undo, redo, canUndo, canRedo, clear };
}
