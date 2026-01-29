const express = require('express');
const router = express.Router();
const authController=require('../controllers/authController');

router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/upload-test', (req, res) => {
  res.send("UPLOAD ROUTE WORKS");
});


module.exports = router;
