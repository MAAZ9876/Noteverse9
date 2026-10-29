# NoteVerse

Share, search and discuss study notes: upload PDF/DOC/PPT notes, like and comment, follow people and chat in real time.

**Stack:** React 18 (Redux Toolkit, MUI v4, styled-components) · Express 4 + Mongoose · MongoDB · socket.io (runs inside the API server) · JWT login.

## Run it

You need **Node 18+** and a **MongoDB** (pick one):

* Docker: `docker compose up -d`   (uses `docker-compose.yml`)
* or a local MongoDB on `127.0.0.1:27017`
* or MongoDB Atlas: put your connection string in `backend/.env` as `MONGO_URL`

Then, from this folder:

```bash
npm run install:all     # installs backend, frontend and the dev runner (once)
npm run dev             # starts API (http://localhost:8000) + website (http://localhost:3000)
```

Prefer two terminals? `cd backend && npm run dev` and `cd frontend && npm start`.

Open http://localhost:3000, create an account and upload a note.

## Configuration

| File | Setting | Meaning |
|---|---|---|
| `backend/.env` | `MONGO_URL` | database connection string |
| `backend/.env` | `JWT_SECRET` | secret that signs login tokens (a random one is already set) |
| `backend/.env` | `CLIENT_ORIGIN` | website address(es) allowed to call the API |
| `frontend/.env` | `REACT_APP_API_URL` | where the API runs (default `http://localhost:8000`) |

The separate `socket/` server was merged into the API, so there is only one backend process now.

## What was fixed (summary)

**Would not start / did not work**
* Backend imported `bcryptjs` but `package.json` listed `bcrypt` -> crashed on a clean install.
* Chat connected to the API port instead of a socket server -> chat now runs on the API's own socket.io, with login-token auth.
* Wrong-password / unknown-email login sent two responses and could crash the server.
* Home feed returned the *oldest* notes first, so new uploads were invisible; now newest first.
* Editing a note without re-typing the file link wiped the file link; the edit form is now pre-filled and blank fields never overwrite data.
* Fixed broken URLs: Banner (`/users` without `/api`), default avatars in comments, chat "online" click, conversation lookup route typo, `/getauthors` route order.
* Fixed crashes for logged-out visitors on profile/footer pages, a double-counted "view" click, popup-blocked PDF opening, and a stuck login button caused by persisted `isFetching`.

**Security**
* Real authentication (JWT). The server now takes the user from the token; nothing is trusted from the request body.
* Users can only edit/delete their own account, notes and conversations (previously anyone could, including setting `isAdmin`).
* Password hashes are never returned by the API (and no longer stored in the browser); emails are not exposed on public user endpoints.
* Uploads need login, are limited to 25 MB and to pdf/doc/docx/ppt/pptx/txt/png/jpg/jpeg/gif/webp; links saved on notes/profiles must point to our uploads or http(s).
* Search input is regex-escaped (no ReDoS / injection); schema validators actually enforce lengths; CORS is limited to your frontend.
* The MongoDB Atlas credentials that were inside `backend/.env` were removed. **That password was exposed - rotate it in Atlas.**

**Cleanup**
* Uploaded files are stored as relative paths (`/uploads/...`) instead of `http://localhost:8000/...`, so the app can be moved to another host.
* One API address setting instead of ~20 hardcoded `localhost` URLs.
* Removed the unused `Banner` component (it imported packages that are not installed).
