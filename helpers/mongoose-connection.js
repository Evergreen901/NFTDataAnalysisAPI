var { connect, connection } = require("mongoose");
const MONGODB_CONNECTION_STRING = `mongodb://0.0.0.0:27017/test`;

const mongooseConnection = async () => {
  connection.on("error", (err) => console.log(`Connection error ${err}`));
  connection.once("open", () => console.log("Connected to DB!"));

  try {
    // Connect to the MongoDB cluster
    await connect(MONGODB_CONNECTION_STRING);
  } catch (e) {
    console.log("could not connect");
  }
};

module.exports = mongooseConnection;
