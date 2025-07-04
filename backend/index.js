import express from 'express';
import dotenv from 'dotenv';
import { vote } from './controllers/voteController.js';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/vote', async (req, res) => {
  try {
    const { userId, pollId, optionId } = req.body;
    if (!userId || !pollId || !optionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await vote({ userId, pollId, optionId });
    res.json({ message: 'Vote berhasil', data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running di port ${PORT}`);
});
