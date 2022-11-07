const { Schema, model, models } = require('mongoose');

const dataSchema = new Schema(
  {
    marketplace: { type: String, required: true },
    signature: { type: String, required: true },
    instruction: { type: String, required: true },
    data: {
      seller: { type: String },
      buyer: { type: String },
      buyerReferral: { type: String },
      sellerReferral: { type: String },
      buyer_expiry: { type: Number },
      seller_expiry: { type: Number },
      expiry: { type: Number },
      price: { type: Number },
      auctionHouse: { type: String },
      tokenAddress: { type: String },
      tokenMint: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

dataSchema.set('timestamps', true);

const transactions =
  models.soltransactions || model('soltransactions', dataSchema);

module.exports = transactions;
