import { NotifiableError } from '@bugsnag/js';
import { isDefined } from '@s-libs/js-core';
import { isString } from '@s-libs/micro-dash';

export function toNotifiableError(error: unknown): NotifiableError {
  if (isNotifiableError(error)) {
    return error;
  } else {
    return new Error(String(error), { cause: error });
  }
}

function isNotifiableError(error: any): error is NotifiableError {
  return (
    isDefined(error) &&
    (isString(error) ||
      (isString(error.name) && isString(error.message)) ||
      (isString(error.errorClass) && isString(error.errorMessage)))
  );
}
