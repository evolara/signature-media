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

The app talks directly to Supabase from the client. Create a table to store booked seats:

1. In the Supabase dashboard, open the SQL editor and run either of these definitions (the front‑end uses `booked_seats`, the earlier API used `reservations`; both are equivalent):
   ```sql
   -- preferred for the current frontend code
   create table booked_seats (
     seat_key text primary key,
     ticket_type text not null,
     created_at timestamp with time zone default now()
   );

   -- alternative name that older instructions mentioned
   create table reservations (
     seat_id text primary key,
     ticket_type text not null,
     created_at timestamp with time zone default now()
   );
   ```

   If you create the `reservations` table but want to keep using the API routes above, you may leave it as is and adjust the table name in the client code.

2. Add a unique index on the seat column if you expect concurrent inserts (the `PRIMARY KEY` already ensures this).
3. Ensure the **anon** role has `SELECT` and `INSERT` permissions on the table. You can either enable public access to the table or add a Row Level Security policy like:
   ```sql
   -- example RLS policy allowing anyone to insert/select
   alter table booked_seats enable row level security;
   create policy "anon read/write" on booked_seats for select using (true);
   create policy "anon insert" on booked_seats for insert with check (true);
   ```

Environment variables needed on Vercel (and in `.env` locally):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

(These map to Vite's `VITE_…` variables automatically during build.)
