import React, { useState, useContext, useEffect } from 'react';
import generateContract from '../../utils/ethers_actions';
import * as wallet from '../../utils/metamask';

interface IContractContext {
  contractList: any,
  getContract: Function,
}

export const ContractContext = React.createContext({} as IContractContext);
export const useContracts = () => useContext(ContractContext);

interface IContract {
  name: string,
  address: string,
  abi: any,
}

interface IAccountProps {
  children: any;
  contracts: IContract[],
  provider: string,
}

const ContractProvider = ({ children, contracts, provider }: IAccountProps) => {
  const [contractList, setContractList] = useState<any>({});

  const createContract = async (item: IContract) => {
    const {name, address, abi} = item;

    const contract = await generateContract(address, abi, provider);
    contract.blockNumber = await contract.provider.getBlockNumber();
    return { name, contract }
  }

  useEffect(() => {
    if (!wallet.isMetaMaskInstalled()) return;

    const setContracts = async()=>{
      let list: any = [];
      for (let index = 0; index < contracts.length; index++) {
        const item = contracts[index];
        const contractHash = await createContract(item);
        list.push(contractHash)
      }
      
      list = list.reduce((result: any, item: IContract) => ({
        ...result,
        [item.name]: { ...item }
      }), {});

      setContractList(list)
    }
    setContracts();
  }, [contracts, provider]);

  const getContract = (name: string) => {
    return contractList[name]?.contract;
  };

  const contextValue: IContractContext = {
    contractList,
    getContract
  }

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
};

export default ContractProvider;
