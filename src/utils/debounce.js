/**
 * Returns a debounced version of `fn` that delays invoking it until after
 * `delay` ms have elapsed since the last call.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - Milliseconds to wait before invoking.
 * @returns {Function} Debounced function with a `.cancel()` method.
 */
export function debounce(fn, delay = 300) {
  let timer = null

  function debounced(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return debounced
}

export default debounce
