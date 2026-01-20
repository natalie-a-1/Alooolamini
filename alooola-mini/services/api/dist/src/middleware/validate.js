/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("../lib/errors");
function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!result.success) {
            return next((0, errors_1.badRequest)("Validation error", {
                issues: result.error.flatten(),
            }));
        }
        req.body = result.data.body;
        req.params = result.data.params;
        req.query = result.data.query;
        return next();
    };
}
