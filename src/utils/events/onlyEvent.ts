export default function onlyEvent<K extends keyof HTMLElementEventMap>(
  eventName: K
): (event: HTMLElementEventMap[K]) => boolean {
  return (event) => event.type === eventName;
}
