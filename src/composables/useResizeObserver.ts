import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import { observeElement } from '../utils/resizeObserver'

interface ResizeObserverSize {
  width: number
  height: number
}

/**
 * Vue composable to safely observe element resizing
 * @param elementRef Ref to the element to observe
 * @returns Object with size information
 */
export function useResizeObserver(elementRef: Ref<Element | null>) {
  const width = ref(0)
  const height = ref(0)
  let cleanup: (() => void) | null = null

  onMounted(() => {
    if (!elementRef.value) return

    // Initialize with current size
    const { width: initialWidth, height: initialHeight } = elementRef.value.getBoundingClientRect()
    width.value = initialWidth
    height.value = initialHeight

    // Set up observer with debouncing to prevent ResizeObserver loop
    cleanup = observeElement(elementRef.value, (entries) => {
      const entry = entries[0]
      if (entry) {
        // Use contentRect to avoid including padding/border in size calculation
        const { width: newWidth, height: newHeight } = entry.contentRect

        // Only update if actually changed to prevent needless rerenders
        if (Math.abs(width.value - newWidth) > 1) {
          width.value = newWidth
        }

        if (Math.abs(height.value - newHeight) > 1) {
          height.value = newHeight
        }
      }
    })
  })

  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  })

  return {
    width,
    height,
    size: ref({
      get width() {
        return width.value
      },
      get height() {
        return height.value
      },
    }) as Ref<ResizeObserverSize>,
  }
}
