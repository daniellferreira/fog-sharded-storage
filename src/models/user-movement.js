const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    shard_server: {
      type: String,
      required: true,
    },
    session_id: {
      type: String,
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
    timestamps: true,
  }
);

module.exports = function () {
  return global.shard_db.model("UserMovement", schema, "user_movements");
};
