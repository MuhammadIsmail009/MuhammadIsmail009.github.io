import portrait from '@/assets/ismail.jpeg'

/**
 * About-section portrait. True color, no stylization — framed at 4:5 in a
 * rounded card with a thin warm hairline so it reads as a deliberate portrait
 * rather than a dropped-in snapshot. The fixed aspect ratio reserves layout
 * space up front, so there's no shift when the image decodes.
 */
export function Portrait() {
  return (
    <figure className="w-full max-w-[22rem]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)]">
        <img
          src={portrait}
          width={960}
          height={1280}
          alt="Muhammad Ismail"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
    </figure>
  )
}
