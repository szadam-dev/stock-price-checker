import express, { type Request, type Response, type Router } from "express";
import swaggerUi from "swagger-ui-express";

import { generateOpenAPIDocument } from "./openAPIDocumentGenerator";

const openAPIRouter: Router = express.Router();
const openAPIDocument = generateOpenAPIDocument();

openAPIRouter.get("/swagger.json", (_req: Request, res: Response) => {
    res.json(openAPIDocument);
});

openAPIRouter.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openAPIDocument));

export { openAPIDocument, openAPIRouter };
