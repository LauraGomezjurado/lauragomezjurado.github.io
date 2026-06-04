/**
 * backgroundState.js
 *
 * Shared scroll signals for the attractor canvas, kept in their own module so
 * that consumers which only *write* these (Home's GSAP choreography, Portfolio's
 * per-project motif) can import them without pulling in the heavy Three.js
 * canvas. MathBackgrounds (the canvas) imports + reads them; the canvas itself
 * is lazy-loaded, so deferring it no longer blocks first paint.
 */

// Written by GSAP, read by the canvas's useFrame.
export const morphState  = { progress: 0 }
export const cameraState = { z: 5.5 }     // default distance; zooms in for Portfolio

// Per-project motif: projects "claim" the background by writing a hue tint
// and intensity. The canvas reads these and modulates color + rotation.
// hue: 0 = attractor default; -1..1 shifts toward warm/cool
// intensity: 0..1 = how much of the project's tint to mix in
export const motifState  = { hue: 0, intensity: 0, spin: 0 }

// Stage: lets sections re-position and shrink the attractor so it sits in a
// defined region of the screen rather than full-bleed. offsetX/Y are in world
// units (-2..2 typical), scale shrinks the curve, opacity attenuates how
// strongly the curve is drawn while keeping it always present.
export const stageState  = { offsetX: 0, offsetY: -0.2, scale: 1, opacity: 1 }
