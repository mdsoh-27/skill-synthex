function errorHandler(err, req, res, next) {
    console.error('🔥 Global Error Handler Caught:', err.message);
    console.error('Stack trace:', err.stack);

    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        details: err.stack
    });
}

module.exports = errorHandler;
