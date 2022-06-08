const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    shard_server: {
      type: String,
      required: true,
    },
    router_address: {
      type: String,
      required: true,
    },
    session_id: {
      type: String,
      required: true,
    },
    connected_at: {
      type: Date,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.index({ session_id: 1 }, { unique: true });
schema.index({ connected_at: 1, user_id: "hashed" });
schema.index({ user_id: "hashed" });

module.exports = mongoose.model("Session", schema);
