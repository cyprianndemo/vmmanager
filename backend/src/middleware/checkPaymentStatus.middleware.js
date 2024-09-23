const checkPaymentStatus = async (req, res, next) => {
    try {
      const paymentStatus = true; 
  
      if (!paymentStatus) {
        return res.status(403).json({ message: 'Payment required before creating VM.' });
      }
  
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking payment status', error: error.message });
    }
  };
  
  module.exports = checkPaymentStatus;
  