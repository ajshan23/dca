"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const yup_1 = require("yup");
const errorHandler_1 = require("../utils/errorHandler");
function validateRequest(schema) {
    return async (req, _res, next) => {
        try {
            await schema.validate({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        }
        catch (err) {
            if (err instanceof yup_1.ValidationError) {
                return next(new errorHandler_1.AppError(err.message, 400));
            }
            const errorMessage = err instanceof Error ? err.message : "Validation failed";
            return next(new errorHandler_1.AppError(errorMessage, 400));
        }
    };
}
//# sourceMappingURL=validationMiddleware.js.map