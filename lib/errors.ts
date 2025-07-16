/**
 * A rich, serialisable HTTP‑aware error class.
 * Suitable for API responses, logging, and frontend consumption.
 *
 * Features
 * ───────────────────────────────────────────
 * • HTTP status                           (statusCode)
 * • Machine‑readable error identifier      (code)
 * • Optional payload for extra context     (details)
 * • Optional root cause reference          (cause)
 * • Automatic stack trace                  (captureStackTrace)
 * • JSON serialisation support             (toJSON)
 */

export class ApiError extends Error {
    /** HTTP status code (e.g. 400, 404). */
    public readonly statusCode: number;

    /** Machine‑readable error identifier (e.g. "NOT_FOUND", "INVALID_INPUT"). */
    public readonly code: string;

    /** Extra debugging or contextual info (non-sensitive). */
    public readonly details?: Record<string, unknown>;

    /** Optional cause (e.g. DB error, validation error). */
    public override readonly cause?: unknown;

    constructor(
        message: string,
        options: {
            statusCode?: number;
            code?: string;
            details?: Record<string, unknown>;
            cause?: unknown;
        } = {}
    ) {
        super(message);
        const {
            statusCode = 500,
            code = "INTERNAL_SERVER_ERROR",
            details,
            cause,
        } = options;

        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.cause = cause;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Converts the error to a clean JSON object.
     * Useful for logging and API responses.
     */
    toJSON() {
        return {
            error: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            details: this.details,
        };
    }

    /* ──────────────── Common HTTP Errors ──────────────── */

    static badRequest(
        msg = "Bad Request",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 400,
            code: "BAD_REQUEST",
            details,
            cause,
        });
    }

    static unauthorized(
        msg = "Unauthorized",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 401,
            code: "UNAUTHORIZED",
            details,
            cause,
        });
    }

    static forbidden(
        msg = "Forbidden",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 403,
            code: "FORBIDDEN",
            details,
            cause,
        });
    }

    static notFound(
        msg = "Not Found",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 404,
            code: "NOT_FOUND",
            details,
            cause,
        });
    }

    static conflict(
        msg = "Conflict",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 409,
            code: "CONFLICT",
            details,
            cause,
        });
    }

    static unprocessableEntity(
        msg = "Unprocessable Entity",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 422,
            code: "UNPROCESSABLE_ENTITY",
            details,
            cause,
        });
    }

    static tooManyRequests(
        msg = "Too Many Requests",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 429,
            code: "TOO_MANY_REQUESTS",
            details,
            cause,
        });
    }

    static internal(
        msg = "Internal Server Error",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR",
            details,
            cause,
        });
    }

    static serviceUnavailable(
        msg = "Service Unavailable",
        details?: Record<string, unknown>,
        cause?: unknown
    ) {
        return new ApiError(msg, {
            statusCode: 503,
            code: "SERVICE_UNAVAILABLE",
            details,
            cause,
        });
    }
}
