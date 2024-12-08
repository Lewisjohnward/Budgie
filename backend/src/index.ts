import express from "express";
import cors from "cors";
// import App from "./services/ExpressApp";
// import dbConnection from "./services/Database";

import path from "path";
import bodyParser from "body-parser";
import { AudioRoute, UserRoute } from "./routes";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { BudgetRoute } from "./routes/BudgetRoute";

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
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"], // Allow GET, POST, and OPTIONS
  }),
);
app.use(helmet());

app.use("/user", UserRoute);
app.use("/budget", BudgetRoute);

app.get("/", (req, res) => {
  res.send("hello from /");
});

if (process.env.NODE_ENV !== "test") {
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
