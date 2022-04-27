import { msgParser } from '../../utils/secure-ether-error-parser';
const ethereumCodes = [
  "CALL_EXCEPTION", 
  "INSUFFICIENT_FUNDS", 
  "NETWORK_ERROR", 
  "NONCE_EXPIRED", 
  "REPLACEMENT_UNDERPRICED", 
  "TRANSACTION_REPLACED", 
  "UNPREDICTABLE_GAS_LIMIT"
];

export const isEthereumError = code => ethereumCodes.includes(code)

export const describeEthereumError = etherError => {
  const {code, message} = etherError;
  const errorData = msgParser(message);
  const errorMessage = "Something was wrong";

  switch (code) {
    case "CALL_EXCEPTION":
      errorMessage = "Invalid call or transaction: Attempt to call a blockchain contract (getter) resulted in a revert or other error";
      break;

    case "INSUFFICIENT_FUNDS":
      break
    
    case "NETWORK_ERROR":
      break

    case "NONCE_EXPIRED":
      break

    case "REPLACEMENT_UNDERPRICED":
      break

    case "TRANSACTION_REPLACED":
      break

    case "UNPREDICTABLE_GAS_LIMIT":
      break
  }

  return {
    ...errorData,
    errorMessage,
    sourceError: etherError,
    type: "ethereum",
  }
}