import { ApiError } from '../utils/ApiError.js'

// Last-mile handler — every thrown ApiError (or unexpected error) ends up
// here as a consistent { message, code? } JSON body, matching what
// api.js's response interceptor already reads: error.response.data.message.
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code })
  }

  // Mongoose validation errors -> 400 with a readable message
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || 'Invalid data' })
  }

  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `No route for ${req.method} ${req.originalUrl}` })
}
