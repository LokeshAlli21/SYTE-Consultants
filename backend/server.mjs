import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
// Importing routes
import authRoutes from './routes/authRoutes.js';
import promoterRoutes from './routes/promoterRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import channelPartnerRoutes from './routes/channelPartnerRoutes.js'
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_ORIGIN_URL, credentials: true }));
app.use(express.json());
app.use(loggerMiddleware);
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/test', (req, res) => {
  console.log('✅ Backend test route hit!');
  res.json({ message: 'Backend is connected successfully!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/promoters', promoterRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/channel-partners',channelPartnerRoutes );

// Main route
app.get('/', (req, res) => {
  console.log("User hit a main route!");
  res.json({ message: 'working fine!' });
});

// Error Middleware
app.use(errorMiddleware);

// Start the server and WebSocket
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});

export default app;