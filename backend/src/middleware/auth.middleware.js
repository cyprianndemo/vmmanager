const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    console.log(process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, email: decoded.email });
    console.log(user);

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) 
  {
    console.log(error);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;