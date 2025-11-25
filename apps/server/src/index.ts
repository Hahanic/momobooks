import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

// const PORT = process.env.PORT || 1234;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Momobooks Server is running");
});

// Start Express Server
app.listen(3000, () => {
  console.log(`Express server listening on port 3000`);
});
