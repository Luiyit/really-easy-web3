import { capitalize } from '../../utils/string-utils';
import { msgParser } from '../../utils/secure-ether-error-parser';
const usageCodes = ["INVALID_ARGUMENT", "MISSING_ARGUMENT", "UNEXPECTED_ARGUMENT", "MISSING_NEW"];

export const isUsageError = code => usageCodes.includes(code)

export const describeUsageError = etherError => {
  const {code, message} = etherError;
  const errorData = msgParser(message);
  const errorMessage = "Something was wrong";

  switch (code) {
    case "INVALID_ARGUMENT":
      errorMessage = capitalize(etherError.reason);
      break;
    
    case "MISSING_ARGUMENT":
      errorMessage = "Missing argument";
      break;
    
    case "UNEXPECTED_ARGUMENT":
      errorMessage = "Too many arguments";
      break;
    
    case "MISSING_NEW":
      errorMessage = "Missing new";
      break;
  }

  return {
    ...errorData,
    errorMessage,
    sourceError: etherError,
    type: "usage",
  }
}