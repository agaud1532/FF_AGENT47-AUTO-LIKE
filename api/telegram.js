import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Telegram API is working",
  });
});

app.post("/", (req, res) => {
  console.log("Telegram update:", req.body);

  res.status(200).json({
    ok: true,
  });
});

export default app;