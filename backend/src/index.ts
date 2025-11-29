import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import objectiveRoutes from './routes/objectiveRoutes';
import keyResultRoutes from './routes/keyResultRoutes';
import approvalRoutes from './routes/approvalRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import companyRoutes from './routes/companyRoutes';
import departmentRoutes from './routes/departmentRoutes';
import quarterRoutes from './routes/quarterRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OKR Management System API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/objectives', objectiveRoutes);
app.use('/api/key-results', keyResultRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/quarters', quarterRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 OKR Management System API`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
