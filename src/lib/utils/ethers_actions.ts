import { ethers, ContractInterface } from "ethers";
declare var window: any;

/**
 * DEV NOTE:
 * Using RPC allow us to connect to a contract and read it 
 * without an account address
 */
export const providerList: any = {
  web3: 'WEB3', 
  localRpc: 'LOCAL_RPC',
  infuraRpc: 'INFURA_RPC',
  customRpc: 'CUSTOM_RPC',
};
export const providers: string[] = Object.keys(providerList).map(key => providerList[key]);

export interface IProvider {
  name: string,
  port: string,
  host: string,
  token: string, 
  network: string,
  version: string,
  rpc: any,
};

// https://web3py.readthedocs.io/en/stable/providers.html
// https://ethereum.org/es/developers/docs/apis/javascript/
export const rpcs: any = {

  LOCAL_RPC: (host= 'http://127.0.0.1', port = '9545') => {
    return new ethers.providers.JsonRpcProvider(`${host}:${port}`);
  },
  // https://infura.io/
  INFURA_RPC: (token: string, network: string="rinkeby", version: string="v3") => {
    return new ethers.providers.JsonRpcProvider(`https://${network}.infura.io/${version}/${token}`);
  },
  WEB3: () => {
    const w3Provider = new ethers.providers.Web3Provider(window.ethereum);
    return w3Provider.getSigner()
  }
};

const generateContract = (address: string, abi: ContractInterface, provider: IProvider): any => {
  try {
    let contractProvider = null;
    switch (provider.name) {
      case providerList.customRpc:
        contractProvider = provider.rpc;
        break;

      case providerList.web3:
        contractProvider = rpcs.WEB3();
        break;
      
      case providerList.localRpc:
        contractProvider = rpcs.LOCAL_RPC(provider.host, provider.port);
        break;
      
      case providerList.infuraRpc:
        contractProvider = rpcs.INFURA_RPC(provider.token, provider.network, provider.version);
        break;
    }

    if(!contractProvider) return null;

    const contract = new ethers.Contract(address, abi, contractProvider);
    // if(testFunction){
    //   await contract[testFunction]();
    // }
    
    return contract;

  } catch (error) { console.error(error); }
  
  return null;
}

export default generateContract;