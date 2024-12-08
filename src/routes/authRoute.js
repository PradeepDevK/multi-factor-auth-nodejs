import { Router } from "express";
import passport from "passport";
import { 
    register,
    login,
    authStatus,
    logout,
    setup2Fa,
    verify2Fa,
    reset2Fa 
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";


const router = Router();


// Registration
router.post('/register', register);

// Login
router.post('/login', passport.authenticate('local'), login);

// Auth Status
router.get('/status', authStatus);

// Logout
router.post('/logout', logout);

// 2FA Setup
router.post('/2fa/setup', isAuthenticated, setup2Fa);

// verify
router.post('/2fa/verify', isAuthenticated, verify2Fa);

// reset
router.post('/2fa/reset', isAuthenticated, reset2Fa);

export default router;