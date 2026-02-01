import express from "express";
import dotenv from "dotenv";
import uploadRoute from "./routes/upload.route";

dotenv.config();

const app = express();

app.use(express.json());

/* routes */
app.use("/api", uploadRoute);

/* server */
const PORT = process.env.PORT || 9009;

app.listen(PORT, () => {
  console.log(`🚀 Vector ingestion service running on port ${PORT}`);
});
