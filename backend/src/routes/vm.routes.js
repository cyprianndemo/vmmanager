const express = require('express');
const VM = require('../models/vm.model');
const User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');
const { sendNotification } = require('../services/notification.service');
const authorize = require('../middleware/authorize.middleware');
const checkPaymentStatus = require('../middleware/checkPaymentStatus.middleware');
const AuditLog= require('../models/auditLog.model');

const router = express.Router();

const vmRoles = ['Admin', 'Standard'];

router.post('/', auth, checkPaymentStatus, async (req, res) => {
  try {
    const { name, specs, owner } = req.body;
    const vm = new VM({
      name,
      specs,
      owner: owner || req.user._id 
    });
    await vm.save();
    res.status(201).send(vm);
  } catch (error) {
    res.status(400).send(error);
  }
});


router.get('/', auth, authorize(['Admin']), async (req, res) => {
  try {
    const vms = await VM.find().populate('owner', 'username email');
    res.send(vms);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const vms = await VM.find({ owner: req.user._id });
    res.send(vms);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const vm = await VM.findById(req.params.id).populate('owner', 'username email');
    if (!vm) {
      return res.status(404).send();
    }
    if (req.user.role !== 'Admin' && vm.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Access denied' });
    }
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'status', 'specs', 'owner'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const vm = await VM.findById(req.params.id);
    if (!vm) {
      return res.status(404).send();
    }

    if (req.user.role !== 'Admin' && vm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Access denied' });
    }

    updates.forEach((update) => {
      if (update === 'specs') {
        Object.assign(vm.specs, req.body.specs);
      } else {
        vm[update] = req.body[update];
      }
    });
    await vm.save();
    res.send(vm);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vm = await VM.findById(req.params.id);
    if (!vm) {
      console.log(`VM with id ${req.params.id} not found`);
      return res.status(404).send({ error: 'VM not found' });
    }

    if (req.user.role !== 'Admin' && vm.owner.toString() !== req.user._id.toString()) {
      console.log(`Access denied for user ${req.user._id} to delete VM ${vm._id}`);
      return res.status(403).send({ error: 'Access denied' });
    }

    await VM.deleteOne({_id: vm._id});
    console.log(`VM ${vm._id} successfully deleted`);
    res.send({ message: 'VM successfully deleted', vm });
  } catch (error) {
    console.error('Error in delete VM route:', error);
    res.status(500).send({ error: 'Internal server error', details: error.message });
  }
});

router.post('/:id/start', async (req, res) => {
  try {
    const vm = await VM.findById(req.params.id);
    if (!vm) {
      return res.status(404).send();
    }
    
    if (req.user.role !== 'Admin' && vm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Access denied' });
    }

    vm.status = 'Running';
    vm.lastStarted = new Date();
    await vm.save();    
    res.send(vm);
    console.log(req, res);
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/:id/stop', auth, authorize(vmRoles), async (req, res) => {
  try {
    const vm = await VM.findById(req.params.id);
    if (!vm) {
      return res.status(404).send();
    }

    if (req.user.role !== 'Admin' && vm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Access denied' });
    }

    vm.status = 'Stopped';
    vm.lastStopped = new Date();
    await vm.save();
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});


router.post('/:id/backup', auth, authorize(vmRoles), async (req, res) => {
  try {
    const vm = await VM.findById(req.params.id);
    if (!vm) {
      return res.status(404).send();
    }
    
    if (req.user.role !== 'Admin' && vm.owner.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: 'Access denied' });
    }

    vm.lastBackup = new Date();
    await vm.save();
    
    res.send(vm);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/:id/move', auth, authorize(['Admin']), async (req, res) => {
  try {
    const { newUserId } = req.body;
    const vm = await VM.findById(req.params.id).populate('owner');
    
    if (!vm) {
      return res.status(404).send({ message: 'VM not found' });
    }

    const newOwner = await User.findById(newUserId);
    if (!newOwner) {
      return res.status(404).send({ message: 'New owner not found' });
    }

    const oldOwner = vm.owner;
    const oldOwnerId = oldOwner._id;

    vm.owner = newUserId;
    await vm.save();

    await sendNotification(oldOwner.email, 'VM Ownership Change', `The VM "${vm.name}" has been moved from your account to ${newOwner.username}.`);
    await sendNotification(newOwner.email, 'New VM Assigned', `A new VM "${vm.name}" has been assigned to your account.`);

    const auditLog = new AuditLog({
      action: 'Move VM',
      details: `Moved VM "${vm.name}" from user ${oldOwner.username} to ${newOwner.username}`,
      performedBy: req.user._id,  
    });
    await auditLog.save();

    res.send({ message: 'VM moved successfully', vm });
  } catch (error) {
    console.error('Error moving VM:', error);
    res.status(500).send({ message: 'Error moving VM', error: error.message });
  }
});

module.exports = router;