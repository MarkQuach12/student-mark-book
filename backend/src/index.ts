import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Student Mark Book API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
