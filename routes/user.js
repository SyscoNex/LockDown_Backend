// routes/user.js
const express = require('express');
const router = express.Router();

router.get('/users', (req, res) => {
  res.json([{ id: 1, name: "John Doe" }]);
});

module.exports = router;
