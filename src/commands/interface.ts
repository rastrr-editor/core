export interface Command {
  name: string;
  execute(): Promise<boolean>;
}
