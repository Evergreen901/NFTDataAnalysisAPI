const express = require('express');
const walletController = require('../controllers/walletController');
const walletRouter = express.Router();

walletRouter
  .route('/marketplaceActivities')
  .post(walletController.getMarketplaceActivities);

walletRouter
  .route('/activitiesRanking')
  .post(walletController.getActivitiesRanking);

walletRouter.route('/profitAndLoss').post(walletController.getProfitAndLoss);

walletRouter.route('/portfolioValue').post(walletController.getPortfolioValue);

walletRouter
  .route('/whalesByPortfolioValue')
  .post(walletController.getWhalesByPortfolioValue);

walletRouter
  .route('/topActiveWallets')
  .post(walletController.getTopActiveWallets);

walletRouter
  .route('/whalesByTransactionAmount')
  .post(walletController.getWhalesByTransactionAmount);

module.exports = walletRouter;
