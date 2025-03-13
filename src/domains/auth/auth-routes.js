import BaseRoutes from "../../base_classes/base-routes.js";
import AuthController from "./auth-controller.js";

import tryCatch from "../../utils/tryCatcher.js";
import validateCredentials from '../../middlewares/validate-credentials-middleware.js';
import { registerSchema, loginSchema, profileSchema } from './auth-schema.js';
import authToken from "../../middlewares/auth-token-middleware.js";

class AuthRoutes extends BaseRoutes {
    routes() {
        this.router.post("/register", [
            validateCredentials(registerSchema),
            tryCatch(AuthController.register)
        ]);
        this.router.post("/login", [
            validateCredentials(loginSchema),
            tryCatch(AuthController.login)
        ]);
        this.router.get("/verify/:token", [
            tryCatch(AuthController.verify)
        ]);
        this.router.get("/me", [
            authToken,
            tryCatch(AuthController.getProfile)
        ]);
        this.router.put("/me/update", [
            authToken,
            validateCredentials(profileSchema),
            tryCatch(AuthController.updateProfile)
        ]);
    }
}

export default new AuthRoutes().router;