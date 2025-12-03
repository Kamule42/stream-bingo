import { timer, concatMap, of, Observable } from 'rxjs';

/**
 * Returns an observable that emits after the specified delay,
 * even if the delay exceeds the maximum safe value for setTimeout.
 */
export const safeTimer = (delayMs: number):  Observable<0> => {
  const MAX_DELAY = 2 ** 31 - 5000
  if (delayMs <= MAX_DELAY) {
    return timer(delayMs)
  }

  const chunks = Math.floor(delayMs / MAX_DELAY)
  const remainder = delayMs % MAX_DELAY

  const result = of(null).pipe(
    concatMap(() =>
      chunks > 0
        ? timer(MAX_DELAY).pipe(
            concatMap(() =>
              chunks > 1
                ? safeTimer((chunks - 1) * MAX_DELAY + remainder)
                : timer(remainder)
            )
          )
        : timer(remainder)
    )
  )
  return result
}