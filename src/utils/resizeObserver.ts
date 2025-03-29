import ResizeObserver from 'resize-observer-polyfill'

let pendingAnimationFrame: number | null = null

/**
 * Creates a debounced resize observer to prevent ResizeObserver loops
 * @param callback Function to call when resize is detected
 * @returns ResizeObserver instance
 */
export const createDebouncedResizeObserver = (
  callback: (entries: ResizeObserverEntry[]) => void,
): ResizeObserver => {
  return new ResizeObserver((entries: ResizeObserverEntry[]) => {
    if (pendingAnimationFrame !== null) {
      cancelAnimationFrame(pendingAnimationFrame)
    }

    pendingAnimationFrame = requestAnimationFrame(() => {
      callback(entries)
      pendingAnimationFrame = null
    })
  })
}

/**
 * Helper composition function to observe an element and handle cleanup
 * @param element Element to observe
 * @param callback Function to call when resize is detected
 * @returns Function to disconnect the observer
 */
export const observeElement = (
  element: Element | null,
  callback: (entries: ResizeObserverEntry[]) => void,
): (() => void) => {
  if (!element) return () => {}

  const observer = createDebouncedResizeObserver(callback)
  observer.observe(element)

  return () => {
    observer.disconnect()
  }
}
