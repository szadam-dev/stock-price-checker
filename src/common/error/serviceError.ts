import { HttpStatus } from "../constants/httpStatusCode";

// To have an own semantic error representation for the service layer.
export class ServiceError extends Error {
    constructor(
        message: string,
        public code = HttpStatus.INTERNAL_SERVER_ERROR,
    ) {
        super(message);
        this.name = ServiceError.name;
    }
}
