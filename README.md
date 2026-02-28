# Signature Media Seat Booking

This repository contains a Vite/React frontend and serverless APIs for seat reservations. The API endpoints run on Vercel Functions and store reserved seats in [Vercel KV](https://vercel.com/docs/kv).

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development frontend:
   ```bash
   npm run dev
   ```
3. (Optional) run the local express server at `server/index.js` for offline testing:
   ```bash
   cd server
   npm install express cors
   node index.js
   ```

Requests will by default hit `/api/reserved` and `/api/reserve`. In development you can also set `VITE_API_URL` to point at a custom server.

## Vercel Deployment

- Push to GitHub; connect the repository to Vercel.
- Add two environment variables in the Vercel dashboard (under **Settings → Environment Variables**):
  - `VERCEL_KV_NAMESPACE` *(provided by Vercel when you add KV)*
  - `VERCEL_KV_TOKEN` *(same)*

  (The `@vercel/kv` package uses these automatically.)

- The `api/` folder is automatically discovered by Vercel; no extra configuration is needed.

Once deployed, all visitors will see real‑time reserved seats; trying to select an already reserved seat will show a message and prevent booking.

## How it works

- **GET `/api/reserved`** returns arrays `{ vip: string[], classic: string[] }` representing taken seats (such as `"A-1"`).
- **POST `/api/reserve`** accepts `{ ticketType, seats }` and attempts to atomically reserve seats. Conflicts yield `409` with the conflicting positions.
- Frontend fetches these endpoints and disables occupied seats.

Feel free to extend with authentication, persistence upgrades or a different database.
