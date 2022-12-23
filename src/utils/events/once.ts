import on from './on';

export default async function* once<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  eventName: K,
  options?: boolean | AddEventListenerOptions
): AsyncGenerator<HTMLElementEventMap[K]> {
  for await (const ev of on(el, eventName, options)) {
    yield ev;
    break;
  }
}
