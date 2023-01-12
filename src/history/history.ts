import uniqid from 'uniqid';
import type { Command } from '~/commands';

export default class History {
  readonly #commands: Command[] = [];
  #lastAppliedCommandIndex = -1;
  #lock: string | null = null;

  get index(): number {
    return this.#lastAppliedCommandIndex;
  }

  get isLocked(): boolean {
    return this.#lock != null;
  }

  push(command: Command): void {
    // If new command is pushed and applied command is not the last - drop all commands after the applied
    if (this.#lastAppliedCommandIndex < this.#commands.length - 1) {
      this.#commands.splice(
        this.#lastAppliedCommandIndex + 1,
        this.#commands.length
      );
    }
    // TODO: limit stack size
    this.#lastAppliedCommandIndex = this.#commands.push(command) - 1;
  }

  async undo(): Promise<boolean> {
    if (this.#lastAppliedCommandIndex >= 0 && !this.isLocked) {
      const id = this.lock();
      return this.#commands[this.#lastAppliedCommandIndex--]
        .undo()
        .finally(() => {
          this.unlock(id);
        });
    }
    return Promise.resolve(false);
  }

  async redo(): Promise<boolean> {
    if (
      this.#lastAppliedCommandIndex < this.#commands.length - 1 &&
      !this.isLocked
    ) {
      const id = this.lock();
      return this.#commands[++this.#lastAppliedCommandIndex]
        .execute()
        .finally(() => {
          this.unlock(id);
        });
    }
    return Promise.resolve(false);
  }

  async goto(index: number): Promise<number> {
    if (index < 0 && index > this.#commands.length - 1) {
      throw new RangeError(`Goto index (${index}) out of range`);
    }
    if (this.isLocked) {
      return this.#lastAppliedCommandIndex;
    }
    const id = this.lock();
    const undo = index < this.#lastAppliedCommandIndex;
    let opIsSuccessful = true;
    while (
      opIsSuccessful &&
      ((undo && this.#lastAppliedCommandIndex > index) ||
        this.#lastAppliedCommandIndex < index)
    ) {
      if (!undo) {
        this.#lastAppliedCommandIndex++;
      }
      const command = this.#commands[this.#lastAppliedCommandIndex];
      if (undo) {
        this.#lastAppliedCommandIndex--;
        opIsSuccessful = await command.undo();
      } else {
        opIsSuccessful = await command.execute();
      }
    }
    this.unlock(id);
    return this.#lastAppliedCommandIndex;
  }

  entries(): IterableIterator<[number, Command]> {
    return this.#commands.entries();
  }

  private lock(): string {
    if (this.#lock != null) {
      throw new Error('History is already locked');
    }
    this.#lock = uniqid();
    return this.#lock;
  }

  private unlock(id: string): void {
    if (this.#lock !== id) {
      throw new Error(
        `Can't unlock, id mismatch, got: ${id}, expected: ${this.#lock}`
      );
    }
    this.#lock = null;
  }
}
