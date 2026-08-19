export class ApiError extends Error {
  constructor(statusCode, message, code) {
    super(message)
    this.statusCode = statusCode
    this.code = code // e.g. 'SLOT_FULL' — lets the frontend branch on specific errors
  }
}
