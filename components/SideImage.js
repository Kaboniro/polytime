// A decorative photo filling the free space beside a page's content (the
// Submit page and every event page). It stretches to the height of the row it
// sits in, bleeds to the window's right edge, and is faded with a CSS mask on
// every edge — much more on the left, so it dissolves into the content side and
// keeps a crisp edge on the right. Hidden below the lg breakpoint, where there
// is no free space beside the content.
const SOFT_MASK = [
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 20%, #000 55%)",
  "linear-gradient(to left, transparent 0%, #000 2%)",
  "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
].join(", ");

// The photos in public/images that suit the page (see the note in README).
export const SIDE_IMAGES = [
  { src: "/images/emma-candy1.jpg", position: "30% 50%" },
  { src: "/images/emma-maina-sky1.jpg", position: "50% 50%" },
  { src: "/images/emma-princess12.jpg", position: "50% 50%" },
];

// The same event always gets the same photo, and neighbours in a list differ.
export const imageForId = (id) => SIDE_IMAGES[Math.abs(Number(id) || 0) % SIDE_IMAGES.length];

// A `cutout` is a transparent PNG: shown whole (not cropped) and not faded.
export default function SideImage({ src, position = "30% 50%", cutout = false }) {
  return (
    <aside
      className="relative hidden min-w-0 flex-1 lg:block"
      aria-hidden="true"
      // Bleeds past the page's max-width container to the window's right edge.
      style={{ marginRight: "calc(-1 * max(1.5rem, (100vw - 72rem) / 2 + 1.5rem))" }}
    >
      <img
        src={src}
        alt=""
        width={1080}
        height={1080}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full ${cutout ? "object-contain" : "object-cover"}`}
        style={
          cutout
            ? { objectPosition: position }
            : {
                objectPosition: position,
                WebkitMaskImage: SOFT_MASK,
                maskImage: SOFT_MASK,
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }
        }
      />
    </aside>
  );
}
