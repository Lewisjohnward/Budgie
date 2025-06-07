import { HttpError } from "./HttpError";

export class UserNotAuthorisedError extends HttpError {
    constructor() {
      super("User not authorised", 401);
    }
  }

  export class MissingOrMalformedAuthorizationHeaderError extends HttpError {
    constructor() {
      super("Missing or malformed authorization header", 401);
    }
  }