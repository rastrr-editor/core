import type TypedEmitter from 'typed-emitter';
import type { Command } from '~/commands';

type HistoryEvents = {
  lock: () => void;
  unlock: () => void;
  resize: (prevLength: number, nextLength: number) => void;
  push: (index: number, command: Command, length: number) => void;
  undo: (index: number, command: Command, success: boolean) => void;
  redo: (index: number, command: Command, success: boolean) => void;
};

export type HistoryEmitter = TypedEmitter<HistoryEvents>;
