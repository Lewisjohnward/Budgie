import express from "express";
import cors from "cors";
// import App from "./services/ExpressApp";
// import dbConnection from "./services/Database";

import path from "path";
import bodyParser from "body-parser";
import { AudioRoute, UserRoute } from "./routes";
import helmet from "helmet";

// export const StartServer = async () => {
if (!process.env.PAYLOAD_SECRET) {
  throw new Error("No value provided for payload secret");
}
console.clear();
// const app = express();

// await dbConnection();

// await App(app);

const test = process.env.DEBUG;
console.log(test);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
// USE HELMET AND CORS MIDDLEWARES
app.use(
  cors({
    origin: ["*"], // Comma separated list of your urls to access your api. * means allow everything
    credentials: true, // Allow cookies to be sent with requests
  }),
);
app.use(helmet());

// app.use("/", (req, res) => {
// return res.json("hello from back end");
// });

app.use("/user", UserRoute);

app.get("/", (req, res) => {
  res.send("hello from /");
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(8000, () => {
      console.log("Listening on port 8000");
  });
}

// app.listen(8000, () => {
//   console.log("Listening on port 8000");
// });
// };

// StartServer();

export default app;
