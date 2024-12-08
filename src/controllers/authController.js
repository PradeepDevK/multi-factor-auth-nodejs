import bcrypt from "bcryptjs";
import User from "../models/user.js";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            password: hashedPassword,
            isMFAActive: false,
        });
        console.log("New User: ", newUser);
        await newUser.save();
        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: "Error registering user",
            message: err 
        })
    }
};

export const login = async (req, res) => {
    try {
        console.log("The authenticated user is ", req.user);

        res.status(200).json({
            message: "User Logged in successfully",
            username: req.user.username,
            isMFAActive: req.user.isMFAActive
        });
    } catch (err) {
        res.status(500).json({
            error: "Error login user",
            message: err 
        })
    }
};

export const authStatus = async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "User Logged in successfully",
            username: req.user.username,
            isMFAActive: req.user.isMFAActive
        });
    } else {
        res.status(401).json({
            message: "Unauthorized user"
        });
    }
};

export const logout = async (req, res) => {
    if(!req.user) res.status(401).json({ message: "Unauthorized user" });
    req.logout((err) => {
        if (err) res.status(400).json({ message: "User not logged in." });
        res.status(200).json({ message: "Logout successfull" });
    })
};

export const setup2Fa = async (req, res) => {
    try {
        console.log("The req.user is ", req.user);
        const user = req.user;
        let secret = speakeasy.generateSecret();
        console.log("The secret object is  ", secret);
        user.twoFactorSecret = secret.base32;
        user.isMFAActive = true;
        await user.save();
        const url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: req.user.username,
            issuer: "pradeepraj.com",
            encoding: "base32",
        });
        const qrImageUrl = await qrCode.toDataURL(url);
        res.status(200).json({
            secret: secret.base32,
            qrCode: qrImageUrl
        });
    } catch (error) {
        res.status(500).json({
            error: "Error setting up 2fa",
            message: err 
        })
    }
};

export const verify2Fa = async (req, res) => {
    const { token } = req.body;
    const user = req.user;

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
    });

    if(verified) {
        const jwtToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            message: "2FA successfull",
            token: jwtToken
        })
    } else {
        res.status(400).json({ 
            message: "Invlaid 2FA"
        });
    }
};

export const reset2Fa = async (req, res) => {
    try {
        const user = req.user;
        user.twoFactorSecret = "";
        user.isMFAActive = false;
        user.save();

        res.status(200).json({
            message: "2FA reset successful"
        });
    } catch (error) {
        res.status(500).json({
            error: "Error resetting 2FA",
            message: error
        })
    }
};