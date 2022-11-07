const { Schema, model, models } = require('mongoose');

const dataSchema = new Schema(
  {
    marketplace: { type: String, required: true },
    transactionHash: { type: String, required: true },
    instruction: { type: String, required: true },
    data: {
      seller: { type: String },
      buyer: { type: String },
      price: { type: Number },
      collectionAddress: { type: String },
      tokenNumber: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

dataSchema.set('timestamps', true);

const transactions =
  models.ethtransactions || model('ethtransactions', dataSchema);

module.exports = transactions;
