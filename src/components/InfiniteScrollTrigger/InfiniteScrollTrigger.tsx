import { useEffect, useRef } from 'react'

interface InfiniteScrollTriggerProps {
  onTrigger: () => void
  hasMore: boolean
  fetching: boolean
}

// InfiniteScrollTrigger uses the IntersectionObserver API to detect when
// the bottom of the list enters the viewport and call `onTrigger` to load more.
//
// Why IntersectionObserver instead of a scroll event listener?
// Scroll listeners fire on every pixel scrolled and need debouncing to avoid
// performance issues. IntersectionObserver fires only when visibility changes —
// it's declarative, efficient, and the browser-native way to do this.
//
// The `rootMargin: '0px 0px 100px 0px'` pre-fires the trigger 100px before
// the element enters the viewport, giving the fetch a head start.
export function InfiniteScrollTrigger({ onTrigger, hasMore, fetching }: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = triggerRef.current
    if (!element || !hasMore) return

    const observer = new IntersectionObserver(
      entries => {
        // Avoid firing fetchMore while a previous fetch is still in flight.
        if (entries[0].isIntersecting && !fetching) {
          onTrigger()
        }
      },
      { rootMargin: '0px 0px 100px 0px' }
    )

    observer.observe(element)
    // Cleanup disconnects the observer when the component unmounts or deps change.
    return () => observer.disconnect()
  }, [hasMore, fetching, onTrigger])

  if (!hasMore) return null

  return (
    <div ref={triggerRef} className="py-6 flex justify-center" aria-live="polite">
      {fetching && (
        <div
          className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          aria-label="Loading more launches"
        />
      )}
    </div>
  )
}
