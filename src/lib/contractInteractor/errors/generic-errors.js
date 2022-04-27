import { msgParser } from '../../utils/secure-ether-error-parser';
const genericCodes = ["NOT_IMPLEMENTED", "SERVER_ERROR", "TIMEOUT", "UNKNOWN_ERROR", "UNSUPPORTED_OPERATION"];

export const isGenericError = code => genericCodes.includes(code)

export const describeGenericError = etherError => {
  const {message} = etherError;
  const errorData = msgParser(message);
  const errorMessage = "Something was wrong";

  return {
    ...errorData,
    errorMessage,
    sourceError: etherError,
    type: "generic",
  }
}