const { Schema, model, models } = require('mongoose');

const dataSchema = new Schema(
  {
    wallet: { type: String, required: true },
    value: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

dataSchema.set('timestamps', true);

const valueSeries =
  models.ethvalueseries || model('ethvalueseries', dataSchema);

module.exports = valueSeries;
