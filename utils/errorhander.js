class ErrorHander extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode

        Error.captureStackTrace(this, this.construstor);
    }
}
export default ErrorHander