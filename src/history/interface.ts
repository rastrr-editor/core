import type TypedEmitter from 'typed-emitter';
import type { Command } from '~/commands';

type UndoRedoEventData = {
  index: number;
  command: Command;
  success: boolean;
  isBatch?: boolean;
};

type HistoryEvents = {
  lock: () => void;
  unlock: () => void;
  resize: (prevLength: number, nextLength: number) => void;
  push: (index: number, command: Command, length: number) => void;
  undo: (data: UndoRedoEventData) => void;
  redo: (data: UndoRedoEventData) => void;
};

export type HistoryEmitter = TypedEmitter<HistoryEvents>;
