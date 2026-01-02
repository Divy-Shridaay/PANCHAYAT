class SuccessResponse {
  constructor(data, message) {
    this.data = data;
    this.message = message;
    this.status = true;
  }
}

module.exports = SuccessResponse;
