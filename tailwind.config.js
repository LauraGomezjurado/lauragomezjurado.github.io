/** @type {import('tailwindcss').Config} */

/**
 * Utilities and CSS variables agree here.
 *
 * This file previously declared a design system that did not exist anywhere on
 * the site: `IBM Plex Sans` (never loaded), plus `primary #B8860B` goldenrod,
 * `background.dark #000000` and `text.primary #FFFFFF`. Zero of those values had
 * a single usage, but `font-sans` still resolved to IBM Plex Sans for anything
 * Tailwind touched - which is a large part of why a "painted" site kept reading
 * as corporate software.
 *
 * Colours are exposed as var() references so there is one place to change them:
 * src/index.css :root, itself sourced from src/design-tokens.json.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Newsreader', 'Georgia', 'serif'],   // "sans" is a lie now, but it
        serif: ['Newsreader', 'Georgia', 'serif'],  // keeps stray font-sans usages
        label: ['Fragment Mono', 'ui-monospace', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        paper: {
          DEFAULT: 'var(--paper)',
          recess: 'var(--paper-recess)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          strong: 'var(--ink-strong)',
          soft: 'var(--ink-soft)',
          quiet: 'var(--ink-quiet)',
        },
        accent: 'var(--accent)',
        hairline: 'var(--hairline)',

        // The pigment box, so a section can reach for a colour by its real name.
        indigo:      'var(--indigo)',
        payne:       'var(--payne)',
        ultramarine: 'var(--ultramarine)',
        teal:        'var(--teal)',
        sap:         'var(--sap)',
        olive:       'var(--olive)',
        ochre:       'var(--ochre)',
        raw:         'var(--raw)',
        sienna:      'var(--sienna)',
        madder:      'var(--madder)',
        rose:        'var(--rose)',
        sepia:       'var(--sepia)',
      },
    },
  },
  plugins: [],
}
