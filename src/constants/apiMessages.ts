export const API_CODES = {
  AUTH: {
    VALIDATION_FAILED: "auth.api.validationFailed",
    EMAIL_EXISTS: "auth.api.emailExists",
    USER_CREATED: "auth.api.userCreated",
    INVALID_CREDENTIALS: "auth.api.invalidCredentials",
  },
  COMMON: {
    SUCCESS: "common.api.success",
    SERVER_ERROR: "common.api.serverError",
    NOT_FOUND: "common.api.notFound",
    UNAUTHORIZED: "common.api.unauthorized",
  },
} as const;
