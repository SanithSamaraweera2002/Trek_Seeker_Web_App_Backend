import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import sequelize from './config/database';
import { associateModels } from './models/associations';

import userRoutes from './routes/userRoutes';
import travelerRoutes from './routes/travelerRoutes';
import tripRoutes from './routes/tripRoutes';
import authRoutes from './routes/authRoute';
import citiesRoutes from './routes/citiesRoute';
import destinationsRoutes from './routes/destinationRoutes';
import generateTripRoutes from './routes/generateTripRoute';
import emailRoutes from './routes/emailRoutes';
import adminRoutes from './routes/adminRoutes';
import hotelRoutes from './routes/hotelRoutes';

const app: Application = express();

dotenv.config();
const PORT = 3002;

//cors
app.use(cors());

//middleware
app.use(express.json());
app.use(morgan('dev'));

// Create Trip Route
app.use('/api', generateTripRoutes);

// Hotel Recommendations Route
app.use('/api', hotelRoutes);

// Email Route
app.use('/api', emailRoutes);

// Auth routes
app.use('/api', authRoutes);

// User routes
app.use('/api', userRoutes);
app.use('/api', travelerRoutes);
app.use('/api', tripRoutes);
app.use('/api', citiesRoutes);
app.use('/api', destinationsRoutes);
app.use('/api', adminRoutes);

// Associations Inilization
associateModels();

// Sync DB
sequelize.sync().then(() => {
  console.log('DB synced');
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
  });
}

export default app;
