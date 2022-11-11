import { Request } from "express";
import { validationResult } from "express-validator/check";
import HttpStatusCodes from "../constants/HttpStatusCodes";
import ApiError from "../models/api-error";

export function checkForValidationErrors(req: Request) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ApiError(
      "Validation failed.",
      HttpStatusCodes.BAD_REQUEST,
      errors.array()
    );
    throw error;
  }
}

/**Acts as a generic type guard for enums.
 * checks that a value is valid member of an enum
 */
export function isSomeEnumChecker<
  T extends string,
  TEnumValue extends string
>(enumVariable: { [key in T]: TEnumValue }) {
  const enumValues = Object.values(enumVariable);
  return (value: string): value is TEnumValue => enumValues.includes(value);
}
