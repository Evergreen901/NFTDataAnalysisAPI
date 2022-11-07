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
  models.solvalueseries || model('solvalueseries', dataSchema);

module.exports = valueSeries;
