/**
 * Shared API URL for all character-sheet SRD hooks.
 *
 * Reads from the VITE_API_URL environment variable at build time.
 * Falls back to the production Render deployment URL when the variable
 * is not set (e.g. when running the built bundle without an .env file).
 */
export const CHARACTER_SHEET_API_URL =
  import.meta.env.VITE_API_URL ?? 'https://daggerheart-tools-4v1t.onrender.com/api';
