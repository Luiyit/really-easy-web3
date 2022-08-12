import { isNonNullChain } from "typescript";

declare var window: any;

// TODO: Add try catch to all calls. Similar way used in contractInteractor
/**
 * https://docs.metamask.io/guide/ethereum-provider.html#errors
 *    https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 *    https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */

/** 
  code: -32603
  data:
    code: -32000
    data: "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a4552433732313a2050524553414c45204e4f5420414354495645000000000000"
    message: "VM Exception while processing transaction: revert ERC721: PRESALE NOT ACTIVE"
    name: "CallError"
    stack: "CallError: VM Exception while processing transaction: revert ERC721: PRESALE NOT ACTIVE\n    at Blockchain.simulateTransaction (/usr/local/lib/node_modules/truffle/node_modules/ganache/dist/node/webpack:/Ganache/chains/ethereum/ethereum/lib/src/blockchain.js:972:19)"
  message: "Internal JSON-RPC error."
*/

// case -32603:
//   return {
//     message: "Exception while processing transaction",
//     reasons: ['Invade method', 'Contract out to date'],
//     sourceError: etherError
//   }


const ethereumProvider = () => {
  // Some wallet extension is installed
  if(window.ethereum){

    // More than one wallet extension is installed
    if(window.ethereum.providers){
      return window.ethereum.providers[0]
    }

    window.ethereum;
  }

  return null;
}


const currentChainId = async () => {
  /*
   * Possible error: 'eth_chainId' is not supported.
   * To avoid it, If browser has more than one provider (e.g. Metamask + Coinbase) some request should be send by one of them, 
   * not for window.ethereum.
   * 
   * So, you will need to use ethereumProvider
   */
  const chainId = await window.ethereum.request({
    method: 'eth_chainId',
  });

  return chainId;
}

const isValidEthereumChain = async (targetNetworkId: string) => {
  // Each networks have an ID. So, we can detect the current network and ask to change it if we need it!
  const chainId = await currentChainId();
  return chainId === targetNetworkId;
}

const switchEthereumChain = async (targetNetworkId: string) => {
  const validChainId = await isValidEthereumChain(targetNetworkId);
  if(!validChainId){
    /*
     * Possible error: MetaMask - RPC Error: Expected 0x-prefixed, un padded, non-zero hexadecimal string 'chainId'.
     * To avoid it, just make sure that the chainId is using a "0x prefixed" format.
     */
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetNetworkId }],
    });
  }
}

/*
 * Request use permission to metamask (popup)
 * @returns - (open popup)
 */
const walletRequestPermision = async () => {
  await window.ethereum.request({
    method: "wallet_requestPermissions",
    params: [{
      eth_accounts: {}
    }]
  });
};

/*
 * Get all the eth connected accounts
 *
 * @param {boolean} switchChain In case to need to change the eth network
 * @param {boolean} forcePopup If is fakeLogout we should show the permission popup
 * @returns string
 */
const requestAccounts = async (switchChain = false, forcePopup = false, targetNetworkId = '') => {
  if(forcePopup) {
    await walletRequestPermision();
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (switchChain && targetNetworkId) switchEthereumChain(targetNetworkId);

  return accounts;
}


/*
 * Check if the app have conection with RCP network
 *
 * @returns boolean
 */
const isRcpConnected = async () => {
  const result = await window.ethereum.isConnected();
  return result;
}

/*
 * Get the current account in use
 * @returns string or null
 */
const getCurrentAccounts = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  return accounts || [];
}

/*
 * 
 * @returns bool
 */
const isAccountConnected = async () => {
  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  return !!accounts?.shift();
}



export default {
  isAccountConnected,
  requestAccounts,
  switchEthereumChain,
  isRcpConnected,
  getCurrentAccounts,
  isValidEthereumChain,
  currentChainId
}