import React, { useState, useContext, useEffect } from 'react';
import generateContract, { IProvider } from '../../utils/ethers_actions';
import * as wallet from '../../utils/metamask';

interface IContractContext {
  contractList: any,
  getContract: Function,
  resetContracts: Function,
}

export const ContractContext = React.createContext({} as IContractContext);
export const useContracts = () => useContext(ContractContext);

interface IContract {
  name: string,
  address: string,
  testFunction: string,
  abi: any,
}

interface IAccountProps {
  children: any;
  contracts: IContract[],
  provider: IProvider,
  deps: any[],
}

const ContractProvider = ({ children, contracts, provider, deps=[] }: IAccountProps) => {
  const [contractList, setContractList] = useState<any>({});

  const createContract = (item: IContract) => {
    const {name, address, abi} = item;

    const contract = generateContract(address, abi, provider);
    if (!contract) return null;

    // TODO: SET UP LATER
    // contract.blockNumber = await contract.provider.getBlockNumber();
    return { name, contract }
  }

  useEffect(() => {
    // if (!wallet.isMetaMaskInstalled()) return;

    let list: any = [];
    for (let index = 0; index < contracts.length; index++) {
      const item = contracts[index];
      const contractHash = createContract(item);
      if(contractHash) list.push(contractHash)
    }
    
    list = list.reduce((result: any, item: IContract) => ({
      ...result,
      [item.name]: { ...item }
    }), {});

    setContractList(list);

  }, [contracts, provider, ...deps]);

  const getContract = (name: string) => {
    return contractList[name]?.contract;
  };

  const resetContracts = () => {
    setContractList({});
  }

  const contextValue: IContractContext = {
    contractList,
    getContract,
    resetContracts,
  }

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

export default ContractProvider;
