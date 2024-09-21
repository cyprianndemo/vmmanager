const express = require('express');
const router = express.Router();
const RatePlan = require('../models/ratePlan.model');
const auth = require('../middleware/auth.middleware');
const adminCheck = require('../middleware/adminAuth.middleware');

// Seed data for rate plans
const seedRatePlans = [
  {
    name: 'Bronze',
    price: 9.99,
    maxVMs: 1,
    maxBackups: 3,
    description: 'Basic plan for small projects'
  },
  {
    name: 'Silver',
    price: 19.99,
    maxVMs: 3,
    maxBackups: 5,
    description: 'Standard plan for growing businesses'
  },
  {
    name: 'Gold',
    price: 49.99,
    maxVMs: 10,
    maxBackups: 10,
    description: 'Premium plan for large enterprises'
  },
  {
    name: 'Platinum',
    price: 99.99,
    maxVMs: 20,
    maxBackups: 20,
    description: 'Ultimate plan for maximum performance'
  }
];

// Function to seed rate plans if none exist
const seedRatePlansIfEmpty = async () => {
  const count = await RatePlan.countDocuments();
  if (count === 0) {
    try {
      await RatePlan.insertMany(seedRatePlans);
      console.log('Rate plans seeded successfully');
    } catch (error) {
      console.error('Error seeding rate plans:', error);
    }
  }
};

// Public route to get all rate plans
router.get('/', async (req, res) => {
  try {
    await seedRatePlansIfEmpty();
    const ratePlans = await RatePlan.find();
    console.log('Rate plans fetched successfully:', ratePlans);
    res.json(ratePlans);
  } catch (error) {
    console.error('Error fetching rate plans:', error);
    res.status(500).json({ message: 'Error fetching rate plans', error: error.message });
  }
});

// Admin routes
router.post('/', auth, adminCheck, async (req, res) => {
  try {
    const { name, price, maxVMs, maxBackups, description } = req.body;
    const ratePlan = new RatePlan({ name, price, maxVMs, maxBackups, description });
    await ratePlan.save();
    res.status(201).json(ratePlan);
  } catch (error) {
    console.error('Error creating rate plan:', error);
    res.status(500).json({ message: 'Error creating rate plan', error: error.message });
  }
});

router.delete('/:id', auth, adminCheck, async (req, res) => {
  try {
    await RatePlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Rate plan deleted' });
  } catch (error) {
    console.error('Error deleting rate plan:', error);
    res.status(500).json({ message: 'Error deleting rate plan', error: error.message });
  }
});

module.exports = router;