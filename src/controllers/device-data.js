const mongoose = require("mongoose");
const Session = require("../models/device-data");

module.exports = {
  saveData: async (req, res) => {
    try {
      const session = new Session(req.body);
      const result = await session.save();

      return res.status(201).json(result);
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
      let { user, connected_from, connected_to } = req.query;

      if ([null, undefined, ""].includes(user, connected_from, connected_to)) {
        return res.status(401).json({
          message:
            "user, connected_from and connected_to are required query string params",
        });
      }

      const filter = {
        user,
        connected_at: {
          $gte: new Date(connected_from).toISOString(),
          $lte: new Date(connected_to).toISOString(),
        },
      };

      const result = await Session.find(filter);

      if (!result || result.length == 0) {
        return res.status(404).json({ message: "track not found" });
      }

      return res.status(200).json(result);
    } catch (error) {
      if (["MongoServerError", "ValidationError"].includes(error.name)) {
        return res.status(400).json(error);
      }
      return res.status(500).json(error);
    }
  },
};
