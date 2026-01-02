class ErrorResponse {
  constructor(message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
    this.status = false;
  }
}

module.exports = ErrorResponse;