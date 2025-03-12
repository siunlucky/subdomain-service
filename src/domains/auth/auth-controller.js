import { successResponse } from "../../utils/response.js";
import AuthService from "./auth-service.js";

class AuthController {
    async login(req, res) {
        const { username, password } = req.body;

        const token = await AuthService.login(username, password);

        if (!token) {
            throw Error("Failed to login");
        }

        return successResponse(res, { token });
    }

    async register(req, res) {
        const { name, username, email, password, phone_number } = req.body;

        const message = await AuthService.register({ name, username, email, password, phone_number });

        if (!message) {
            throw Error("Failed to register");
        }

        return successResponse(res, message);
    }

    async verify(req, res) {
        const { token } = req.params;

        const message = await AuthService.verify(token);

        if (!message) {
            throw Error("Failed to verify");
        }

        return res.redirect(`${process.env.FE_URL}/login?verify=success`);

    }
}

export default new AuthController();