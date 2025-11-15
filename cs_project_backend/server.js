import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardroutes from "./routes/dashboardroutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"; // <--- 1. IMPORT THE NEW ROUTE

dotenv.config();
//database connection
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// CRITICAL: Makes files in the 'uploads' directory publicly accessible via the '/uploads' URL path.
app.use('/uploads', express.static('uploads')); 
// ADD THIS LINE: Makes question images public
app.use('/uploads/questions', express.static('uploads/questions')); 

// -------------------------------------------------------------
// ROUTE MOUNTING
// -------------------------------------------------------------

// AI ROUTES: /api/v1/ai
app.use("/api/v1/ai", aiRoutes); // <--- 2. MOUNT THE NEW ROUTE

// DOCUMENTS: /api/v1/documents
app.use("/api/v1/documents", documentRoutes); 

// AUTH: /api/v1/auth
app.use("/api/v1/auth", authRoutes);

// DASHBOARD: /api/v1/dashboard
app.use("/api/v1/dashboard", dashboardroutes);

// PROFILE: /api/v1/profile
app.use("/api/v1/profile", profileRoutes);


app.get("/", (req, res) => {
    res.send("<h1> Welcome To Your Testing Platform </h1>");
});

const PORT = 3000;

//run listen
app.listen(PORT, () => {
    console.log(`Server is running on Development mode on port 3000`.bgCyan.white);
});