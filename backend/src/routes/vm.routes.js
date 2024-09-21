const express = require('express');
const VM = require('../models/vm.model');
const auth = require('../middleware/auth.middleware');
const { sendNotification } = require('../services/notification.service');
const checkVMLimits = require('../middleware/checkVMLimit.middleware');
const authorize = require('../middleware/authorize.middleware'); 
const checkPaymentStatus = require('../middleware/checkPaymentStatus.middleware');


const router = express.Router();

const vmRoles = ['Admin', 'Standard']; // Adjust roles as needed

// Create a new VM
router.post('/', async (req, res) => {
  try {
    console.log(req);
    const vm = new VM({
      name: req.body.name,
      //status: 'pending',
      owner: req.body.userId

    });
    await vm.save();
    res.status(201).send(vm);
  } catch (error) {
    res.status(400).send(error);
  }
});
router.get('/user',async (req, res) => {
  try{
  const vms = await VM.find({ owner: req.user._id });
  res.send(vms);
}catch (error) {
  res.status(500).send();
}
});

router.post('/vms', async (req, res) => {
    try {
      const { name, resources } = req.body;
      const vm = new VM({ name, resources, user: req.user._id });
      await vm.save();
      res.status(201).json(vm);
    } catch (error) {
      res.status(500).json({ message: 'Error creating VM', error: error.message });
    }
  });


// Get all VMs for the logged-in user
router.get('/', async (req, res) => {
  try {
    console.log(req.user._id);

    const vms = await VM.find();
    res.send(vms);
  } catch (error) {
    res.status(500).send();
  }
});

// Get a specific VM by ID
router.get('/:id', async (req, res) => {
  try {
    const vm = await VM.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vm) {
      return res.status(404).send();
    }
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});

// Update a VM
router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'status', 'specs'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const vm = await VM.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vm) {
      return res.status(404).send();
    }

    updates.forEach((update) => vm[update] = req.body[update]);
    await vm.save();
    res.send(vm);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a VM
router.delete('/:id', async (req, res) => {
  try {
    const vm = await VM.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!vm) {
      return res.status(404).send();
    }
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});

// Start a VM
router.post('/:id/start', async (req, res) => {
  try {
    const vm = await VM.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vm) {
      return res.status(404).send();
    }
    vm.status = 'Running';
    await vm.save();
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});
// Start VM and send notification
router.post('/:id/start', auth, authorize(vmRoles), async (req, res) => {
    try {
      const vm = await VM.findOne({ _id: req.params.id, owner: req.user._id });
      if (!vm) {
        return res.status(404).send();
      }
      
      vm.status = 'Running';
      await vm.save();
  
      // Notify user
      const user = await User.findById(req.user._id);
      await sendNotification(user.email, 'VM Started', `Your VM ${vm.name} has been started.`);
      
      res.send(vm);
    } catch (error) {
      res.status(500).send();
    }
  });

// Stop a VM
router.post('/:id/stop', async (req, res) => {
  try {
    const vm = await VM.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vm) {
      return res.status(404).send();
    }
    vm.status = 'Stopped';
    await vm.save();
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});

//  VM backup
router.post('/:id/backup', auth, authorize(vmRoles), async (req, res) => {
    try {
      const vm = await VM.findOne({ _id: req.params.id, owner: req.user._id });
      if (!vm) {
        return res.status(404).send();
      }
      
      vm.lastBackup = new Date();
      await vm.save();
      
      res.send(vm);
    } catch (error) {
      res.status(500).send();
    }
  });

  router.post('/', auth, checkPaymentStatus, async (req, res) => {
    try {
      const { name, resources } = req.body;
      const vm = new VM({ name, resources, user: req.user._id });
      await vm.save();
      res.status(201).json(vm);
    } catch (error) {
      res.status(500).json({ message: 'Error creating VM', error: error.message });
    }
  });
  
  router.patch('/:id/move', async (req, res) => {
    try {
      const { newUserId } = req.body;
      const vm = await VM.findById(req.params.id);
      
      if (!vm) {
        return res.status(404).send({ message: 'VM not found' });
      }
  
      vm.owner = newUserId;
      await vm.save();
  
      res.send({ message: 'VM moved successfully', vm });
    } catch (error) {
      res.status(500).send({ message: 'Error moving VM', error: error.message });
    }
  });

module.exports = router;
