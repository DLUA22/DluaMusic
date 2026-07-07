const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db.js');
const songRoutes = require('./src/routes/songRoutes');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/songs', songRoutes);

connectDB();

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DluaMusic API đang vận hành ổn định!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server đang chạy tại Port: ${PORT}`);
});