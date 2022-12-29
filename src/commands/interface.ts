import { Color } from '~/color';

export type CommandOptions = {
  color?: Color;
  width?: number;
  lineCap?: 'butt' | 'round' | 'square';
};

export interface Command {
  name: string;
  execute(): Promise<boolean>;
}
