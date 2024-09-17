import express from 'express';
import { sendEmailController } from '../controllers/emailController';
import upload from '../config/multerConfig';

const router = express.Router();

router.post('/send-email', upload.single('file'), sendEmailController);

export default router;
