import app from "./app"

if (process.env.NODE_ENV !== "test") {
  app.listen(8000, () => {
    console.log("Listening on port 8000");
  });
}
