import BaseRoutes from "../../../base_classes/base-routes.js";
import SubdomainController from "./subdomain-controller.js";

import tryCatch from "../../../utils/tryCatcher.js";
// import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class SubdomainRoutes extends BaseRoutes {
    routes() {
        this.router.get("/", [tryCatch(SubdomainController.index)]);
        this.router.get("/:id", [tryCatch(SubdomainController.show)]);
        this.router.post("/", [tryCatch(SubdomainController.create)]);
        this.router.put("/:id", [tryCatch(SubdomainController.update)]);
        this.router.delete("/:id", [tryCatch(SubdomainController.delete)]);
    }
}

export default { 
    "v1": new SubdomainRoutes().router,
};