# CampusShare — Frontend

A production-quality React frontend built against the existing CampusShare Express/MongoDB
backend. Every screen, field, and action here is wired to a real backend route — nothing is
mocked or hardcoded.

---

## A. Backend analysis

**Stack:** Node.js + Express + Mongoose (MongoDB), CommonJS modules.

**Entry point:** `backend/index.js` — loads `dotenv`, connects to MongoDB via
`config/db.js`, mounts five route groups under `/api`, and enables `cors()` with **no
origin restrictions** (all origins allowed) and `express.json()` for body parsing.

**Auth:** JWT-based. `middleware/authMiddleware.js`'s `protect` reads
`Authorization: Bearer <token>`, verifies it with `JWT_SECRET`, loads the user (minus
password) onto `req.user`. Tokens are signed with a 7‑day expiry and carry only `{ id }`.
There is no refresh-token flow — the frontend must send the user back to `/login` once the
token expires or is rejected.

**Models**
| Model | Key fields |
|---|---|
| `User` | `name`, `email` (unique), `password` (hashed), `college`, `phone` — all required; `profileImage` (default `""`) |
| `Item` | `owner` (ref User), `name`, `category` (free string), `description`, `condition` (enum: New/Good/Fair/Poor), `listingType` (enum: Sell/Rent/GiveAway), `price`, `rentPricePerDay`, `securityDeposit`, `availableFrom`, `availableUntil`, `quantity` (default 1), `location`, `images` (string array), `isAvailable` (default true) |
| `Request` | `item`, `requester`, `owner` (refs), `message`, `status` (enum: PENDING/ACCEPTED/REJECTED/CANCELLED/COMPLETED, default PENDING) |
| `Notification` | `recipient`, `sender` (refs User), `request`, `item` (refs), `message`, `type` (enum: NEW_REQUEST/REQUEST_ACCEPTED/REQUEST_REJECTED), `isRead` (default false) |

**Ownership rules enforced server-side:** only an item's `owner` can update/delete it
(403 otherwise); only a request's `owner` can accept/reject it; a user cannot request
their own item or create a second PENDING request for the same item.

**What the backend does *not* have** (confirmed by reading every controller/route):
no image upload endpoint (only stores whatever URL strings you send), no pagination, no
location filter, no category-list endpoint, no "my items" endpoint, no cancel-request
endpoint, no delete/mark-all-read for notifications, no password change / account
deletion, no messaging system, no public "view another user's profile" endpoint.

---

## B. API mapping

| Frontend feature | Endpoint | Method | Auth | Request body | Response |
|---|---|---|---|---|---|
| Register | `/api/auth/register` | POST | No | `{name,email,password,confirmPassword,college,phone}` | `{_id,name,email,college,phone}` |
| Login | `/api/auth/login` | POST | No | `{email,password}` | `{_id,name,email,college,token}` |
| Get my profile | `/api/users/profile` | GET | Yes | — | full user (no password) |
| Update profile | `/api/users/profile` | PUT | Yes | any of `{name,college,phone,profileImage}` | updated user subset |
| Browse listings | `/api/items` | GET | No | query: `search,listingType,category,condition,available` | array of items (owner populated: name, college) |
| Listing details | `/api/items/:id` | GET | No | — | item (owner populated: name, college, phone) |
| Create listing | `/api/items` | POST | Yes | Item fields (see table above) | created item |
| Edit listing | `/api/items/:id` | PUT | Yes, owner only | any Item fields | updated item |
| Delete listing | `/api/items/:id` | DELETE | Yes, owner only | — | `{message}` |
| Request an item | `/api/requests` | POST | Yes | `{itemId,message}` | created request |
| My sent requests | `/api/requests/my` | GET | Yes | — | array (item + owner populated) |
| Requests I received | `/api/requests/incoming` | GET | Yes | — | array (item + requester populated) |
| Accept request | `/api/requests/:id/accept` | PATCH | Yes, owner only | — | updated request (also sets item `isAvailable:false`) |
| Reject request | `/api/requests/:id/reject` | PATCH | Yes, owner only | — | updated request |
| Notifications | `/api/notifications` | GET | Yes | — | array (sender name, item name populated) |
| Mark notification read | `/api/notifications/:id/read` | PATCH | Yes, recipient only | — | updated notification |

**Derived, not invented:** "My Listings" and dashboard stats are computed client-side by
fetching `GET /api/items` and filtering where `item.owner._id === currentUser._id`,
because the backend has no dedicated "my items" route. Similarly, the category filter
dropdown is built from the distinct `category` values found in a fetched item list,
since the backend has no category-list endpoint.

---

## C. Frontend architecture

```
src/
├── api/                # one file per resource, thin wrappers around axios
│   ├── axios.js         # base instance, auth header injection, 401 handling
│   ├── auth.js  users.js  items.js  requests.js  notifications.js
├── context/AuthContext.jsx
├── hooks/               useAuth.js, useDebounce.js
├── routes/ProtectedRoute.jsx
├── lib/                 utils.js (cn, formatters), constants.js (backend enums), queryClient.js
├── components/
│   ├── ui/               Button, Input, Textarea, Select, Label, Card, Badge,
│   │                     Spinner/Skeleton, Avatar, Dialog, ConfirmDialog, Dropdown, EmptyState
│   ├── layout/           Navbar, Footer, Layout
│   ├── listings/         ListingCard, ListingGrid, SearchBar, FilterPanel, ListingForm
│   ├── requests/         RequestCard
│   ├── dashboard/        StatCard
│   └── notifications/    NotificationBell, NotificationItem
├── pages/                Home, Login, Register, Listings, ListingDetails, Dashboard,
│                         MyListings, CreateListing, EditListing, MyRequests,
│                         RequestsReceived, Notifications, Profile, NotFound
├── App.jsx  main.jsx  index.css
```

Design system lives in `src/index.css` as Tailwind v4 `@theme` tokens (brand/ink/neutral
palettes + sell/rent/give accents), consumed everywhere through the `ui/` primitives so
spacing, radii, and color usage stay consistent without duplicating classes.

---

## D. Dependencies (and why)

- **react, react-dom** — UI runtime.
- **react-router-dom** — routing, protected routes, nested layout.
- **axios** — HTTP client with interceptors for auth headers + error normalization.
- **@tanstack/react-query** — server-state caching, loading/error states, invalidation
  after mutations (create/update/delete listing, accept/reject request, mark read).
- **react-hook-form + @hookform/resolvers + zod** — form state and schema validation
  for Login, Register, Profile, and the listing create/edit form.
- **sonner** — toast notifications for success/error feedback.
- **framer-motion** — subtle hover/entrance/menu transitions (used selectively).
- **lucide-react** — icon set.
- **clsx + tailwind-merge** — the `cn()` utility for conditional class merging.
- **date-fns** — installed for date utilities (lightweight custom formatters in
  `lib/utils.js` are used directly; date-fns is available if you extend date handling).
- **tailwindcss + @tailwindcss/vite** — utility CSS, Tailwind v4's Vite plugin (no
  separate `tailwind.config.js`/PostCSS config needed — content is auto-scanned).

No UI kit like shadcn/ui was pulled in as a dependency (it isn't an installable package —
its CLI copies component source into your repo). Instead, equivalent primitives
(`Button`, `Dialog`, `Dropdown`, etc.) were hand-built in `components/ui/` in the same
spirit: unstyled-by-default, composable, Tailwind-based.

---

## E. Environment variables

Create `frontend/.env` (see `.env.example`):

```
VITE_API_URL=http://localhost:5000
```

This is the **only** environment variable the frontend needs. It must point at your
running backend's origin (no `/api` suffix — that's appended in `src/api/axios.js`).
No secrets belong here; it's a public build-time value bundled into the client.

⚠️ **Backend `.env` note:** the backend repo you provided includes a live `.env` with a
real `MONGO_URI` (containing a database username/password) and a `JWT_SECRET` committed
to disk. Neither of these were used anywhere in the frontend, but you should rotate
those credentials and add `.env` to the backend's `.gitignore` before making the
repository public.

---

## F. Running instructions

**Backend** (unchanged, run as-is):
```bash
cd backend
npm install
npm run dev        # or: node index.js
```

**Frontend:**
```bash
cd frontend
cp .env.example .env     # then edit VITE_API_URL if needed
npm install
npm run dev              # http://localhost:5173
```

Build for production:
```bash
npm run build
npm run preview
```

> Note: dependencies could not be installed or the dev server run in this sandboxed
> environment because outbound network access is disabled here. Every file was written
> by hand against the exact backend contract and statically checked (import/export
> resolution, JSX tag balance) — please run `npm install && npm run dev` locally to do a
> live smoke test before presenting.

---

## G. Backend limitations

These are real gaps found while reading the backend source — not assumptions. Each is
handled gracefully in the UI rather than faked.

1. **No image upload.** `Item.images` is just `[String]`; there is no `multer`/upload
   route anywhere in `routes/` or `controllers/`. The create/edit listing form accepts
   pasted image **URLs** instead of file uploads, with an inline note explaining why.
   *Suggested backend change:* add `multer` + a static/`/uploads` route or a cloud
   storage (S3/Cloudinary) upload endpoint returning a URL to store in `images`.

2. **No "my listings" endpoint.** `GET /api/items` returns every item in the database
   regardless of caller. My Listings and the Dashboard stats filter the full list
   client-side by `item.owner._id === user._id`. This works correctly but is inefficient
   at scale and leaks the *existence* of every listing to any client that queries it
   (already true for the public Browse page, so this isn't a new exposure, but it does
   mean "my listings" isn't a real query — just a client-side view).
   *Suggested backend change:* add `GET /api/items/mine` (protected) filtering by
   `owner: req.user._id` in `itemController.js`.

3. **No server-side pagination.** `getItems` returns the full matching set in one
   response. The Browse page renders everything returned; with a large catalog this
   will get slow. *Suggested backend change:* accept `page`/`limit` query params and
   return `{ items, total, page, pages }` from `itemController.getItems`.

4. **No location filter.** `Item.location` is a free-text field but `getItems` never
   reads a `location` query param, so no location filter was added to the UI (adding one
   would silently do nothing).

5. **No category list.** `category` has no enum in `Item` schema and no endpoint lists
   distinct categories. The Browse page's category dropdown is populated from whatever
   categories currently exist in fetched listings, and the create form offers common
   suggestions via a `<datalist>` but doesn't restrict input — matching the backend's
   actual (unrestricted) behavior.

6. **No cancel-request action for requesters.** `requestController.js` only exposes
   `accept`/`reject` for the item **owner**; there's no route letting a requester cancel
   their own pending request. The "Requests sent" page is therefore read-only by design.
   *Suggested backend change:* add `PATCH /api/requests/:id/cancel`, restricted to
   `request.requester`, setting status to `CANCELLED`.

7. **No notification delete or "mark all as read".** Only
   `PATCH /api/notifications/:id/read` exists. The UI marks notifications read one at a
   time (on click) and has no delete/clear-all button since the backend can't do it.

8. **No account/password management.** No change-password or delete-account endpoints
   exist, so the Profile page only edits `name`, `college`, `phone`, `profileImage` —
   exactly what `userController.updateProfile` accepts.

9. **No messaging system.** There are no message-related models, controllers, or
   routes anywhere in the backend. **Messaging is not currently supported by the
   backend**, so no messaging UI was built. Coordination after a request is accepted
   currently relies on the phone number the backend already exposes to the item owner
   once a request is `ACCEPTED` (shown on the Requests Received page).

---

## H. Testing summary

Since outbound network access is disabled in this environment, `npm install` could not
be run here, so the app could not be built or opened in a browser from this sandbox.
What *was* verified:

- **Static correctness:** every `@/...` import resolves to a real file; every named/
  default import matches an actual export in its target file (scripted check across all
  `.js`/`.jsx` files, 0 mismatches).
- **JSX structural balance:** open/close tag counts verified for every page and complex
  component (all balanced).
- **Contract accuracy:** every request/response shape in `src/api/*.js` and every field
  used in forms/cards was cross-checked line-by-line against the actual controller and
  model source you provided (not assumed from the prompt) — including exact enum values,
  populate field lists, and status codes.
- **Auth flow logic:** token persistence, profile hydration on reload, 401 → forced
  logout + redirect to `/login?expired=1`, and protected-route redirect-with-return-path
  were traced through manually.

**Please do before presenting:** run `npm install && npm run dev` locally with your
backend running, then click through: register → login → browse → view a listing →
create a listing → request someone else's item → accept/reject on the owning account →
check notifications → edit/delete your own listing → edit profile → logout → confirm a
protected route redirects to `/login` → let a token expire (or clear `localStorage`) and
confirm the session-expired redirect. This sandbox's lack of network access is the only
reason that manual pass hasn't already been done for you.
