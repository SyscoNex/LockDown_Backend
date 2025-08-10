
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'f4etsg5etgrs5hfg5esrg6r7j'; // Use env in production

exports.generateToken = (user, role = 'teacher') => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: role
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};
