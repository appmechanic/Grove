import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes

import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";


// Routes declaration
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
export default app;
       

