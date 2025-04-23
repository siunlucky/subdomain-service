import BaseRoutes from "../../../base_classes/base-routes.js";
import SubdomainController from "./subdomain-controller.js";

import tryCatch from "../../../utils/tryCatcher.js";
// import validateCredentials from '../../middlewares/validate-credentials-middleware.js';

class SubdomainRoutes extends BaseRoutes {
    routes() {
        this.router.post("/", [tryCatch(SubdomainController.create)]);
        this.router.delete("/", [tryCatch(SubdomainController.delete)]);

        this.router.post("/slug", [tryCatch(SubdomainController.addSlug)]);
        this.router.delete("/slug", [tryCatch(SubdomainController.deleteSlug)]);
    }
}

export default { 
    "v1": new SubdomainRoutes().router,
};