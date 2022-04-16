const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('passwordConfirm', { title: 'Password Reset' });
});

module.exports = router;