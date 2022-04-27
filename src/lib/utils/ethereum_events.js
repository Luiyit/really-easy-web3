//CHECK: ACCOUNT_CHANGED: Symbol("accountsChanged"),
export const EVENTS_TYPES = {
  ACCOUNT_CHANGED: "accountsChanged",
  CHAIN_CHANGED: "chainChanged",
  MESSAGE: "message",
};

function eventHandlerException(message, name) {
  this.message = message;
  this.name = name;
}

export default function registerListener(callback){  
  if (typeof(callback) !== 'function') 
    throw new eventHandlerException("Invalid argument: callback should be a function", "useEthereumEventsError")
  
  const accountsChanged = accounts => callback(EVENTS_TYPES.ACCOUNT_CHANGED, accounts );
  window.ethereum.on('accountsChanged', accountsChanged);

  const chainChanged = chainId => callback(EVENTS_TYPES.CHAIN_CHANGED, chainId );
  window.ethereum.on('chainChanged', chainChanged);

  const message = msg => callback(EVENTS_TYPES.MESSAGE, msg );
  window.ethereum.on('message', message);
  
  return () => {
    window.ethereum.removeListener('accountsChanged', accountsChanged);
    window.ethereum.removeListener('chainChanged', chainChanged);
    window.ethereum.removeListener('message', message);
  }
}