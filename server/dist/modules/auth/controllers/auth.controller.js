import { AdminAuthService } from "../services/auth.service.js";
export class AuthController {
    // POST /api/v1/auth/admin/signup
    static async adminSignUp(req, res) {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Full Name, Email Address, and Password are required."
                });
                return;
            }
            const result = await AdminAuthService.adminSignUp(name, email, password, role);
            res.status(201).json({
                success: true,
                message: "Admin account registered successfully in MySQL database!",
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || "Failed to register admin user."
            });
        }
    }
    // POST /api/v1/auth/admin/signin
    static async adminSignIn(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email Address and Password are required."
                });
                return;
            }
            const result = await AdminAuthService.adminSignIn(email, password);
            res.status(200).json({
                success: true,
                message: "Signed in successfully!",
                data: result
            });
        }
        catch (err) {
            res.status(401).json({
                success: false,
                message: err.message || "Authentication failed."
            });
        }
    }
    // GET /api/v1/auth/admin/me
    static async adminMe(req, res) {
        try {
            const adminId = req.user?.id;
            if (!adminId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized: Missing authentication context."
                });
                return;
            }
            const admin = await AdminAuthService.getAdminProfile(adminId);
            res.status(200).json({
                success: true,
                data: admin
            });
        }
        catch (err) {
            res.status(404).json({
                success: false,
                message: err.message
            });
        }
    }
}
