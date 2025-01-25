export const ErrorHandler = (err, req, res, next) => {
    if (!(err instanceof Error)) {
        err = new Error("Unknown error");
        err.statusCode = 500;
    }
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: err.stack,
    });
};