import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Orvexa backend running",
    });
});

export default app;
