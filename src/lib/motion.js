import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

// ── Liquid motion language — single source of truth ───────────────────────
// One set of curves shared by every screen so the whole site feels like one
// fluid system. Previously these were defined twice (App.jsx + Maintenance.jsx)
// and had already drifted (liquidDrip existed only in App). Register once here.
//   liquid     — viscous flow (slow surface tension at start, smooth glide,
//                gentle settle). The default ease for everything.
//   liquidFlow — symmetric inOut, like fluid pouring through a narrow neck.
//   liquidPour — heavy decel, like water arriving at a basin and slowing as
//                it fills. Use for "settles into place" motion.
//   liquidDrip — slight overshoot, like a droplet hitting and rebounding.
let registered = false

export function registerLiquidEases() {
  if (registered) return
  gsap.registerPlugin(CustomEase)
  CustomEase.create('liquid',     'M0,0 C0.22,0.04 0.16,1 1,1')
  CustomEase.create('liquidFlow', 'M0,0 C0.65,0.02 0.05,0.98 1,1')
  CustomEase.create('liquidPour', 'M0,0 C0.16,0.86 0.18,1 1,1')
  CustomEase.create('liquidDrip', 'M0,0 C0.34,1.18 0.22,0.97 1,1')
  registered = true
}

// True if the visitor has asked the OS to minimise non-essential motion.
// CSS @media (prefers-reduced-motion) cannot stop a GSAP/JS timeline, so any
// JS-driven entrance must check this and jump straight to its end state.
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
