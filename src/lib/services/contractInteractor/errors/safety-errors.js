import { msgParser } from '../../../utils/secure-ether-error-parser';
const safetyCodes = ["BUFFER_OVERRUN", "NUMERIC_FAULT"];

export const isSafetyError = code => safetyCodes.includes(code)

export const describeSafetyError = etherError => {
  const {message} = etherError;
  const errorData = msgParser(message);
  const errorMessage = "Something was wrong";

  return {
    ...errorData,
    errorMessage,
    sourceError: etherError,
    type: "safety",
  }
}