const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA = path.join(__dirname, 'reservations.json');

async function readData() {
  try {
    const raw = await fs.readFile(DATA, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { vip: [], classic: [] };
  }
}

async function writeData(obj) {
  await fs.writeFile(DATA, JSON.stringify(obj, null, 2), 'utf8');
}

app.get('/reserved', async (req, res) => {
  const data = await readData();
  res.json(data);
});

// Reserve seats atomically; returns 409 with conflicts if any seat already taken
app.post('/reserve', async (req, res) => {
  const { ticketType, seats } = req.body || {};
  if (!ticketType || !Array.isArray(seats)) return res.status(400).json({ error: 'invalid_payload' });

  const data = await readData();
  const current = new Set(data[ticketType] || []);
  const conflicts = seats.filter(s => current.has(`${s.row}-${s.number}`));
  if (conflicts.length > 0) return res.status(409).json({ error: 'conflict', conflicts });

  seats.forEach(s => current.add(`${s.row}-${s.number}`));
  data[ticketType] = Array.from(current);
  await writeData(data);
  res.json({ success: true, reserved: data });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Reservation server listening on http://localhost:${PORT}`));
