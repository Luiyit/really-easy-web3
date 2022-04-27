/**
 * Error handler for ether v5.4
 * https://docs.ethers.io/v5/api/utils/logger/#errors
 * 
 */
import { isGenericError, describeGenericError } from './generic-errors';
import { isSafetyError, describeSafetyError } from './safety-errors';
import { isUsageError, describeUsageError } from './usage-errors';
import { isEthereumError, describeEthereumError } from './ethereum-errors';

export function ExceptionEther(data){
  const self = this;
  Object.keys(data).forEach(key => {
    self[key] = data[key]
  })
};
 
export const describeError = etherError => {
  const {code} = etherError;

  if(isGenericError(code)){
    return describeGenericError(etherError)
  }

  if(isSafetyError(code)){
    return describeSafetyError(etherError)
  }

  if(isUsageError(code)){
    return describeUsageError(etherError)
  }
  
  if(isEthereumError(code)){
    return describeEthereumError(etherError)
  }

  return {
    message: "Something was wrong",
    originalError: etherError
  }  
}