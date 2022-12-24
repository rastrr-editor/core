import type { Command } from '~/commands';

export default class History {
  readonly #commands: Command[] = [];
  #currentCommandIndex?: number;

  push(command: Command): void {
    this.#commands.push(command);
    this.#currentCommandIndex = this.#commands.length - 1;
  }

  undo(): void {
    //
  }

  redo(): void {
    //
  }

  goto(index: number): void {
    //
  }

  entries(): IterableIterator<[number, Command]> {
    return this.#commands.entries();
  }
}
