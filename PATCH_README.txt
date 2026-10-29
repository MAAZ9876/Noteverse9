NoteVerse Modern UI — corrected patch

This patch contains the modern Home page and navbar files, with a Material UI v4-compatible icon fix.

How to apply:
1. Stop the frontend dev server (Ctrl+C).
2. Extract this ZIP into your NoteVerse project ROOT — the folder containing package.json, frontend, and backend.
3. Allow the three files to replace the files at the same paths.
4. From the NoteVerse project ROOT, run `npm.cmd run dev` to start API + web together.
   Alternatively, use separate terminals: `cd backend` then `npm.cmd run dev`; and `cd frontend` then `npm.cmd start`.
5. Open http://localhost:3000.

No node_modules or .env files are included. Your local credentials/configuration are preserved.

Validation:
The frontend production build completed successfully in a test copy after this fix. Existing project lint warnings remain in older components (unused imports, missing image alt text, and hook dependency notices); those are warnings, not webpack compile errors.
