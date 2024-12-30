import express from "express";
import cors from "cors";
// import App from "./services/ExpressApp";
// import dbConnection from "./services/Database";

import path from "path";
import bodyParser from "body-parser";
import { UserRoute, BudgetRoute } from "./routes";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// export const StartServer = async () => {
if (!process.env.PAYLOAD_SECRET) {
  throw new Error("No value provided for payload secret");
}
console.clear();



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
  res.status(200).json({ ping: "pong" });
});

export default app;
