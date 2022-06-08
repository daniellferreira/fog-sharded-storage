const Session = require("../models/session");
const UserMovement = require("../models/user-movement");

async function validateSession(sessionId, userId) {
  if (!sessionId || !userId) {
    throw { message: "session_id or user_id is required" };
  }

  const session = await Session().findOne({
    session_id: sessionId,
    user_id: userId,
  });
  if (!session || session.status !== "active") {
    throw { message: "invalid session_id" };
  }
}

module.exports = {
  saveData: async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"];
      const { user_id } = req.params;

      await validateSession(sessionId, user_id);

      const userData = new UserMovement()({
        shard_server: process.env.SHARD_SERVER_ID,
        session_id: sessionId,
        user_id: user_id,
        metadata: req.body,
      });
      const savedData = await userData.save();

      return res.status(201).json(savedData);
    } catch (error) {
      console.log(error.name);
      if (["MongoServerError", "ValidationError"].includes(error.name)) {
        return res.status(400).json(error);
      }
      return res.status(500).json(error);
    }
  },
  getData: async (req, res) => {
    try {
      let { session_id } = req.query;

      const filter = {
        session_id: { $in: session_id.split(",") },
      };

      const result = await UserMovement().find(filter);

      return res.status(200).json(result);
    } catch (error) {
      if (["MongoServerError", "ValidationError"].includes(error.name)) {
        return res.status(400).json(error);
      }
      return res.status(500).json(error);
    }
  },
};
