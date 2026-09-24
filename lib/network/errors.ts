export type TargetErrorCode =
  | "invalid_target"
  | "target_blocked"
  | "response_too_large"
  | "timeout"
  | "network_error";

export class TargetValidationError extends Error {
  constructor(
    public code: TargetErrorCode,
    message: string,
    public status = 400,
    public details?: unknown,
  ) {
    super(message);
    this.name = "TargetValidationError";
  }
}
