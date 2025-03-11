import { successResponse } from "../../utils/response.js";
import AuthService from "./auth-service.js";

class AuthController {
    async login() {
        const { username, password } = req.body;

        const token = await AuthService.login(username, password);

        if (!token) {
            throw Error("Failed to login");
        }

        return successResponse(res, token);
    }

    async register() {
        const { username, email, password, phone_number } = req.body;

        const user = await AuthService.register({ username, email, password, phone_number });

        if (!user) {
            throw Error("Failed to register");
        }

        return successResponse(res, "User registered successfully.");
    }
}

export default new AuthController();