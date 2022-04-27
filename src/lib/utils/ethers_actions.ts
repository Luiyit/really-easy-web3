import { ethers, ContractInterface } from "ethers";
declare var window: any;

export const providerList: any = {
  web3: 'WEB3', 
  localRpc: 'LOCAL_RPC',
  infuraRpc: 'INFURA_RPC',
};
export const providers: string[] = Object.keys(providerList).map(key => providerList[key]);

// https://web3py.readthedocs.io/en/stable/providers.html
// https://ethereum.org/es/developers/docs/apis/javascript/
export const web3Providers: any = {

  LOCAL_RPC: async (host= 'http://127.0.0.1', port = '9545') => {
    return new ethers.providers.JsonRpcProvider(`${host}:${port}`);
  },
  // https://infura.io/
  INFURA_RPC: async (token: string, network: string="rinkeby", version: string="v3") => {
    return new ethers.providers.JsonRpcProvider(`https://${network}.infura.io/${version}/${token}`);
  },
  WEB3: async () => {
    const w3Provider = new ethers.providers.Web3Provider(window.ethereum);
    return w3Provider.getSigner()
  }
};

const generateContract = async (address: string, abi: ContractInterface, provider: string='web3'): Promise<any> => {
  try {
    const ethProvider = await web3Providers[provider]();
    return new ethers.Contract(address, abi, ethProvider);
  } catch (error) { console.log(error); }
  return null;
}

export default generateContract;