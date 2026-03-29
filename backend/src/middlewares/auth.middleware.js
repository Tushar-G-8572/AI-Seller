import jwt from "jsonwebtoken";

export async function authMiddleware(req, res, next) {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded
        next();

    } catch (err) {
        console.error("Auth Middleware Error:", err);

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}