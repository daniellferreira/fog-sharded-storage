const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "expired"],
      default: "active",
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

schema.index({ session_id: 1 }, { unique: true });
schema.index({ user_id: "hashed" });
schema.index({ session_id: 1, user_id: "hashed" });

module.exports = function () {
  return global.registerSession_db.model("Session", schema);
};
