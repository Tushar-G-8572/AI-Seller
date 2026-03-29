import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';

export async function handleRegisterController(req, res) {
    try {
        let { username, email, password } = req.body;

        email = email.toLowerCase();

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // ✅ Create user
        const user = await userModel.create({
            username,
            email,
            password,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (err) {
        console.error("Register Error:", err);

        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error while registering user"
        });
    }
}

export async function handleLoginController(req, res) {
    try {
        let { email, password } = req.body;

        email = email.toLowerCase();

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"2d"
            }
        );

        res.cookie("token", token);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user._id,
                email: user.email,
            }
        });

    } catch (err) {
        console.error("Login Error:", err);

        return res.status(500).json({
            success: false,
            message: "Error while logging in user"
        });
    }
}

export async function handleGetMeController(req, res) {
    try {
        const  {id}  = req.user;
        const user = await userModel
            .findById(id)
            .select("username email")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (err) {
        console.error("GetMe Error:", err);

        return res.status(500).json({
            success: false,
            message: "Error while fetching user"
        });
    }
}

export async function handleLogoutController(req, res) {
    try {
        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (err) {
        console.error("Logout Error:", err);

        return res.status(500).json({
            success: false,
            message: "Error while logging out"
        });
    }
}