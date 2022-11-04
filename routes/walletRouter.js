const express = require('express');
const walletController = require('../controllers/walletController');
const walletRouter = express.Router();

walletRouter
  .route('/getMarketplaceActivities')
  .post(walletController.getMarketplaceActivities);

walletRouter
  .route('/getActivitiesRanking')
  .post(walletController.getActivitiesRanking);

walletRouter.route('/getProfitAndLoss').post(walletController.getProfitAndLoss);

walletRouter
  .route('/getPortfolioValue')
  .post(walletController.getPortfolioValue);

module.exports = walletRouter;
