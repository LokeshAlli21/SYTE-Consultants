import express from 'express';
import { loginUser, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middlewares/protect.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/user', protect, getCurrentUser);

export default router;
