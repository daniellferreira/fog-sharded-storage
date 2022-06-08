require("dotenv/config");
global.log = require("./logger");

const App = require("./app");

(async function () {
  const app = new App();

  try {
    await app.init();

    const port = process.env.PORT || 80;
    const server = app.server.listen(port);

    log.info(`Server running on port ${process.env.PORT}`);

    server.on("close", handleExit(app));
    server.on("error", handleExit(app));

    process.stdin.resume();
    process.on("SIGINT", callClose(server));
    process.on("exit", callClose(server));
    process.on("uncaughtException", callClose(server));
  } catch (e) {
    log.error(e);
  }
})().catch(log.error);

function callClose(server) {
  return function (signalOrError) {
    if (signalOrError instanceof Error) {
      log.error(
        `Error received, started to close server...\n stack: ${signalOrError.stack}`
      );
      process.exit(1);
    } else {
      log.info(
        `Signal [${signalOrError}] received, started to close server...`
      );
    }

    server.close();
  };
}

function handleExit(app) {
  return function () {
    return new Promise(async function () {
      await app.close();
      log.info("App ready to close");
      process.exit(0);
    });
  };
}
