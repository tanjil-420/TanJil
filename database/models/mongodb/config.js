const { Schema, model } = require("mongoose");

const configSchema = new Schema({
  key: {
    type: String,
    unique: true,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  minimize: false
});

// Indexes for performance
configSchema.index({ key: 1 });

module.exports = model("config", configSchema);