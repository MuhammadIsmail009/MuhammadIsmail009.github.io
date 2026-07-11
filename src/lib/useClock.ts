import { useEffect, useState } from 'react'
import { SITE } from '@/lib/content'

const fmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: SITE.timezone,
})

/** Live wall clock in the site's home timezone (ticks once a second). */
export function useClock(): string {
  const [now, setNow] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt.format(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}
