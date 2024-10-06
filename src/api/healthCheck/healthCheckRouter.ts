import { HttpStatus } from "@common/constants/httpStatusCode";
import { ENVIRONMENT_VARS } from "@common/utils/envConfig";
import { type Request, type Response, Router } from "express";

export const HEALTH_CHECK_PATH = `${ENVIRONMENT_VARS.API_ROOT_PATH}/health-check`;

export const healthCheckRouter = (): Router => {
    const router: Router = Router();

    router.get(HEALTH_CHECK_PATH, (_req: Request, res: Response): void => {
        res.sendStatus(HttpStatus.SUCCESS);
    });

    return router;
};
