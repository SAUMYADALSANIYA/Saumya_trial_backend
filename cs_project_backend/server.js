import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardroutes from "./routes/dashboardroutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();
//database connection
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1",dashboardroutes);
app.use("/api/v1",profileRoutes);

app.get("/", (req, res) => {
    res.send("<h1> Welcome To Your Testing Platform </h1>");
});

const PORT = 3000;

//run listen
app.listen(PORT, () => {
    console.log(`Server is running on Development mode on port 3000`.bgCyan.white);
});
