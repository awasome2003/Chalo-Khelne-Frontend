import { useEffect, useRef, useState } from "react";

/**
 * Smoothly animated collapsible container using ref-based height measurement.
 *
 * Why not a fixed max-height like 9999px:
 *   With overflow-hidden, content beyond max-height is clipped. If max-height
 *   transitions from 9999 → 0 over 150ms but the actual content is 600px,
 *   the visible region stays at 600 until max-height drops below 600 — i.e.
 *   the very end of the transition. Result: "nothing happens, then snap" =
 *   perceived jank.
 *
 *   This component drives max-height from scrollHeight so the entire
 *   transition is visually progressive. While idle and open, it switches to
 *   max-height: auto so dynamic content (e.g. category rows being added)
 *   doesn't clip.
 */
export default function Collapsible({
  open,
  children,
  className = "",
  duration = 150,
}) {
  const innerRef = useRef(null);
  const isFirst = useRef(true);
  const [maxH, setMaxH] = useState(open ? "auto" : "0px");

  useEffect(() => {
    if (!innerRef.current) return;

    if (isFirst.current) {
      // Skip animation on initial mount — sit at the static end-state.
      isFirst.current = false;
      setMaxH(open ? "auto" : "0px");
      return;
    }

    const h = innerRef.current.scrollHeight;

    if (open) {
      // 0px → measured height → "auto" (after settle).
      setMaxH(`${h}px`);
      const t = setTimeout(() => setMaxH("auto"), duration);
      return () => clearTimeout(t);
    } else {
      // Snap to current measured height, then animate to 0 next frame.
      setMaxH(`${h}px`);
      const raf = requestAnimationFrame(() => setMaxH("0px"));
      return () => cancelAnimationFrame(raf);
    }
  }, [open, duration]);

  return (
    <div
      style={{
        maxHeight: maxH,
        opacity: open ? 1 : 0,
        transition: `max-height ${duration}ms ease-out, opacity ${Math.min(duration, 100)}ms ease-out`,
      }}
      className={`overflow-hidden ${className}`}
      aria-hidden={!open}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
