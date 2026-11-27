import { AppError } from "../errors/AppErrors";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertUuid(value: string, message: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new AppError(400, message);
  }
}
