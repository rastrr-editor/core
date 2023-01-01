export function normalizeHEX(hex: string) {
  if (!hex.match(/^#(?=[a-f0-9]*$)(?:.{3}|.{6}|.{8})$/i)) {
    throw new Error(`Invalid hex: ${hex}`);
  }
  let opacity = '';
  let buffer = hex.substring(1);
  if (buffer.length === 3) {
    buffer = buffer
      .split('')
      .map((x) => x + x)
      .join('');
  } else if (buffer.length === 8) {
    opacity = buffer.substring(6);
    buffer = buffer.substring(0, 6);
  }
  return `#${buffer}${opacity}`.toUpperCase();
}
