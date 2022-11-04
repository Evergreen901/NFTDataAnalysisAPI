const { Schema, model, models } = require("mongoose");

const dataSchema = new Schema(
  {
    marketplace: { type: String, required: true },
    signature: { type: String, required: true },
    instruction: { type: String, required: true },
    data: { type: Array },
  },
  {
    timestamps: true,
  }
);

dataSchema.set("timestamps", true);

const transactions = models.transactions || model("transactions", dataSchema);

module.exports = transactions;
