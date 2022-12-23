export default function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  eventName: K,
  options?: boolean | AddEventListenerOptions
): AsyncIterableIterator<HTMLElementEventMap[K]> {
  let eventHandler: ((event: HTMLElementEventMap[K]) => void) | null = null;
  function listener(this: HTMLElement, event: HTMLElementEventMap[K]) {
    eventHandler?.(event);
    // Reset event handler before another next is called
    eventHandler = null;
  }
  el.addEventListener(eventName, listener, options);
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      return new Promise((resolve) => {
        eventHandler = (event: HTMLElementEventMap[K]) =>
          resolve({ done: false, value: event });
      });
    },
    return() {
      el.removeEventListener(eventName, listener);
      return Promise.resolve({ value: undefined, done: true });
    },
  };
}
