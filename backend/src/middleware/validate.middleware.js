import { ApiError } from '../utils/ApiError.js'

// Runs a zod schema against req.body; on failure, returns a 400 with the
// first field error instead of letting a malformed request reach Mongoose.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const firstIssue = result.error.issues[0]
      return next(new ApiError(400, `${firstIssue.path.join('.')}: ${firstIssue.message}`))
    }
    req.body = result.data
    next()
  }
}
