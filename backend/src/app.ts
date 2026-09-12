import express from "express";
import cors from "cors";

import path from "path";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorHandler } from "./shared/middleWare/errorHandler";

import budgetRoutes from "./features/budget/budget.router";
import userRoutes from "./features/user/user.router";
import { testRoutes } from "./e2e/test.router";

if (!process.env.PAYLOAD_SECRET) {
  throw new Error("No value provided for payload secret");
}
console.clear();

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(":date[web]"));
  app.use(morgan("dev"));
}

if (
  process.env.ENABLE_TEST_ROUTES === "true" &&
  process.env.NODE_ENV !== "production"
) {
  app.use("/__test__", testRoutes);
}

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "DELETE", "PATCH"],
  })
);
app.use(helmet());

app.use("/user", userRoutes);
app.use("/budget", budgetRoutes);

app.get("/", (_, res) => {
  res.status(200).json({ ping: "pong" });
});

app.use(errorHandler);

export default app;
