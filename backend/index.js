require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pollsRouter = require('./routes/polls');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/polls', pollsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
