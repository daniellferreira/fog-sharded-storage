const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");

const DeviceDataController = require("./controllers/device-data");

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => log.info(message.trim()),
    },
  }
);

class App {
  constructor() {
    this.server = express();
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(morganMiddleware);
  }

  async init() {
    log.info("Connecting to db...");

    await mongoose.connect(process.env.DB_CONNECTION_STRING);

    this.registerRoutes();
  }

  async close() {
    await mongoose.disconnect();
    log.info("Closed db connection");
  }

  registerRoutes() {
    this.server.get("/ots/ping", (req, res) => {
      res.send(`pong`);
    });

    this.server.post("/ots/register-session", SessionController.saveSession);
    this.server.get("/ots/track-user", SessionController.trackUser);
  }
}

module.exports = App;
