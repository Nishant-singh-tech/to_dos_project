# Smart Planner – Full-Stack Task Manager (v2)

React 18 + Express + MongoDB, with accounts. One deployment: the backend serves the built frontend.

```
smart-planner/
├── backend/    Express API: auth, tasks, validation, security
└── frontend/   React (Vite) app
```

## Features
**Accounts:** register / log in (JWT, bcrypt), every user sees only their own tasks.
**Tasks:** add, edit, delete, complete · priority · due date with overdue highlight · notes · tags (max 5).
**Recurring tasks:** daily / weekly / monthly. Completing one schedules the next (month-end safe: Jan 31 → Feb 28).
**Drag-and-drop reordering**, saved to the database (Manual order, All tab, no search/tag filter).
**Dashboard:** completed vs total, overdue / due-today flags, 7-day completion chart.
**Views:** All / Active / Completed · live search (title + notes) · tag filter · sort (manual, newest, due, priority).
**Bulk:** mark all done, clear completed.
**UX:** optimistic updates with rollback on error, toasts, dark mode, shortcuts (`n` new task, `/` search).
**Backend hardening:** zod validation, helmet, rate limiting, gzip, per-user data scoping, central error handler.

## 1. Get a free MongoDB database (5 minutes)
1. Create an account at mongodb.com/atlas → create a free **M0** cluster.
2. Database Access → add a user (username + password).
3. Network Access → Add IP Address → **Allow access from anywhere** (0.0.0.0/0).
4. Connect → Drivers → copy the connection string and put your password in it.

## 2. Run locally
```bash
cd backend
copy .env.example .env      # (Mac/Linux: cp)  then edit .env: MONGODB_URI and JWT_SECRET
npm install
npm run dev                 # API on :5000

# second terminal
cd frontend
npm install
npm run dev                 # open http://localhost:5173
```
Production-style (one server), from the root folder:
```bash
npm run build && npm start  # http://localhost:5000  (needs backend/.env)
```
Run tests: `npm test` (recurrence logic + filter/sort/stats helpers).

## 3. Deploy on Render (one Web Service)
1. Push the whole `smart-planner` folder to GitHub (root contains `package.json`).
2. Render → New → Web Service → pick the repo, leave Root Directory empty.
3. Build command: `npm run build` · Start command: `npm start`
4. Environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = long random string
   - `NODE_ENV` = `production`
5. Deploy. App and API are both on the one Render URL. Data is permanent in Atlas.

(`render.yaml` is included for Blueprint deploys. Railway works the same way.)

## API
All `/api/tasks/*` routes need `Authorization: Bearer <token>`.
| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Current user |
| GET | /api/tasks | List my tasks |
| POST | /api/tasks | Create |
| PATCH | /api/tasks/:id | Update (returns `{task, next}`; `next` is the new recurring task) |
| DELETE | /api/tasks/:id | Delete |
| PUT | /api/tasks/reorder | Save manual order `{ids:[...]}` |
| POST | /api/tasks/complete-all | Mark all done |
| DELETE | /api/tasks/completed | Remove completed |
| GET | /api/health | Health check |

## Interview talking points
- **Immutability:** reducer returns new arrays/objects via map/filter/spread; React re-renders by comparing references.
- **useReducer vs useState:** many related transitions (add, replace, reorder, bulk) on one state shape.
- **Derived state:** visible list, stats and chart data are computed from `tasks`, never stored separately; list is memoised.
- **Custom hook:** `useLocalStorage` owns state + an effect, so it must be a hook (utility functions can't use hooks).
- **Optimistic UI:** dispatch first, sync after, reload server truth if the request fails.
- **Keys:** stable ids, not array index, so edit/drag state stays on the right row after deletes or reorders.
- **Security:** passwords hashed with bcrypt, JWT auth middleware, every query filtered by `user`, input validated with zod, rate-limited auth routes.
- **Layering:** routes → validation → controllers → models; recurrence logic is a pure, tested function.
