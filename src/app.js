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

    global.shard_db = await mongoose
      .createConnection(process.env.DB_CONNECTION_STRING_SHARD)
      .asPromise();
    global.registerSession_db = await mongoose
      .createConnection(process.env.DB_CONNECTION_STRING_REGISTER_SESSION)
      .asPromise();

    // await mongoose.connect(process.env.DB_CONNECTION_STRING);

    this.registerRoutes();
    global.log.info("Registered routes:");
    this.server._router.stack.forEach(function (r) {
      if (r.route && r.route.path) {
        global.log.info(r.route.path);
      }
    });
  }

  async close() {
    await mongoose.disconnect();
    log.info("Closed db connection");
  }

  registerRoutes() {
    const baseUrl = `fog-${process.env.SHARD_SERVER_ID}`;

    this.server.get(`/${baseUrl}/ping`, (req, res) => {
      res.send(`pong`);
    });

    this.server.post(
      `/${baseUrl}/save-data/:user_id`,
      DeviceDataController.saveData
    );
    this.server.get(
      `/${baseUrl}/get-data`,
      (req, res, next) => {
        if (!req.query.session_id) {
          return res.status(400).json({
            message:
              "at least one session_id is required in query string to perform this operation",
          });
        }
        next();
      },
      DeviceDataController.getData
    );
  }
}

module.exports = App;
