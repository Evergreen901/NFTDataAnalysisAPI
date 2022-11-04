const { Router: expressRouter } = require('express');
const router = expressRouter();

// wallet routes
const walletRouter = require('./walletRouter');
router.use('/wallet', walletRouter);

module.exports = router;
