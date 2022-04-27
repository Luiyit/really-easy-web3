import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import { useContracts } from '../../providers/contract/ContractProvider';
import { describeError, ExceptionEther } from './errors/handler'
import registerListener from './events';

/**
 * Call safety any contract method
 * 
 * @param {function} callback Contract method to invoke
 * @param  {...any} args 
 * 
 * @returns invoke return
 */
const contractCall = async (callback: Function, ...args: any) => {
  try {
    const result = await callback(...args);
    return result;
  } catch (error) {
    const errorData = describeError(error);
    // TODO: Check it
    throw ExceptionEther(errorData);    
  }
};

export interface IContract {
  on: Function;
  listen: Function;
  listenFromNow: Function;
  sourceContract: ethers.Contract,
};

/**
 * Creates an interface to interact with the contract
 * It provides extra method to simplify certain actions.
 * 
 * @param {string} contractName Contract name to interact
 * @returns Contract wrapper interactor
 */
const useInteractor = function(contractName: string){
  const [contractInterface, setContractInterface] = useState(null);
  const contractState: any = useContracts();
  
  // Todo: Validate context
  if (!contractState) return {};

  const contract = contractState.getContract(contractName);
    
  useEffect(() => {
    if (contract){
      const methodNames = Object.keys(contract).filter(
        key => typeof contract[key] === 'function' && key.indexOf(')') < 0,
      );
    
      const contractCallable = methodNames
        .map(name => ({
          [name](...args: any) {
            return contractCall(contract[name], ...args);
          },
        }))
        .reduce((hash, current) => ({ ...hash, ...current }), {});
    
      /**
       *  todo: We should going to add the rest of prototype methods here Contract extends BaseContract 
       */
      const iContract = {
        sourceContract: contract,
        ...contract,
        ...contractCallable,
        on: (...args: any) => { contract.on(...args) },
        listen: (callback: Function, eventList: string[]) => registerListener(callback, eventList, contract),
        listenFromNow: (callback: Function, eventList: string[]) => registerListener(callback, eventList, contract, true),
      }
      
      setContractInterface(iContract)
    }
  }, [contract])

  return contractInterface;
};

export default useInteractor;