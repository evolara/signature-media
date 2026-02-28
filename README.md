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

### Supabase Setup

The backend now uses Supabase for storage. To prepare your database:

1. In the Supabase dashboard, open the SQL editor and run:
   ```sql
   create table reservations (
     seat_id text primary key,
     ticket_type text not null,
     created_at timestamp with time zone default now()
   );
   ```
2. Make sure the `anon` key has `insert`/`select` rights on that table (enable public schema access or adjust RLS policies).

Your environment should contain the public variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already provided above); serverless functions will also use them automatically.
