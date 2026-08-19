// Wrap every controller in this so a thrown/rejected error in an async
// function reaches errorHandler.js instead of crashing the process or
// hanging the request.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
