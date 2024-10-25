require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');


const { configurePassport } = require('./src/config/passport');

const adminRoutes = require('./src/routes/admin.routes');
const activitiesRouter = require('./src/routes/activities');
const userRoutes = require('./src/routes/user.routes');
const vmRoutes = require('./src/routes/vm.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const authRoutes = require('./src/routes/auth.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const userDashboardRoutes = require('./src/routes/userDashboardRoutes');
const authMiddleware = require('./src/middleware/adminAuth.middleware');
const authorize = require('./src/middleware/authorize.middleware');
const auth = require('./src/middleware/auth.middleware');
const ratePlanRoutes = require('./src/routes/ratePlan.routes')
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/vms', auth, vmRoutes);
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/dashboard', auth, userDashboardRoutes);
app.use('/api/subscriptions', auth, subscriptionRoutes);
app.use('/api/users', auth, userRoutes)
app.use('/api/rate-plans', ratePlanRoutes);
app.use('/api/activities', activitiesRouter);



let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', accountStatus: 'active' }
];

let features = [
  { id: 1, name: 'Additional VM', price: 10 },
  { id: 2, name: 'Backup Service', price: 5 }
];

let payments = [
  { id: 1, userId: 1, feature: 'Additional VM', amount: 10, date: '2024-09-15' },
  { id: 2, userId: 1, feature: 'Backup Service', amount: 5, date: '2024-09-10' }
];

app.get('/api/user/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/api/features', (req, res) => {
  res.json(features);
});

app.get('/api/payments/:userId', (req, res) => {
  const userPayments = payments.filter(p => p.userId === parseInt(req.params.userId));
  res.json(userPayments);
});

app.post('/api/payment', (req, res) => {
  const { userId, featureId } = req.body;
  const user = users.find(u => u.id === userId);
  const feature = features.find(f => f.id === featureId);

  if (!user || !feature) {
    return res.status(400).json({ error: 'Invalid user or feature' });
  }

  const newPayment = {
    id: payments.length + 1,
    userId,
    feature: feature.name,
    amount: feature.price,
    date: new Date().toISOString().split('T')[0]
  };

  payments.push(newPayment);
  res.json({ success: true, payment: newPayment });
});

app.get('/api/admin/payments', (req, res) => {
  res.json(payments);
});

app.post('/api/admin/suspend/:userId', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.userId));
  if (user) {
    user.accountStatus = 'suspended';
    res.json({ success: true, user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});
app.get('/api/rate-plans', async (req, res) => {
  try {
    const ratePlans = await RatePlan.find();
    res.json(ratePlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rate plans', error: error.message });
  }
});


const mongoURI = process.env.MONGO_URI || "mongodb+srv://21s01acs014:oevyJ1z5dLsYG4Tw@cluster0.0akv8.mongodb.net/vm_management?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, 
  socketTimeoutMS: 45000
})
.then(() => {
  console.log("Successfully connected to MongoDB!");
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1); 
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log("MongoDB connection closed.");
  process.exit(0);
});
