import express, { urlencoded } from "express";
import expressSession from "express-session";
import passport from "passport";
import dotEnv from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/authRoute.js";
import "./config/passportConfig.js";

dotEnv.config();
dbConnect();

const app = express();

// Middleware
const corOptions = {
    origin: ["http://localhost:3001"],
    credentials: true,
};
app.use(cors(corOptions));
app.use(express.json({ limit: "100mb" }));
app.use(urlencoded({ limit: "100mb", extended: true }));
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60,
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);

// Listen our app
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});