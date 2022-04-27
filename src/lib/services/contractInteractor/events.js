/**
 * Subscribe to contract event with a single callback
 * 
 * @param {function} callback Client function to invoke
 * @param {array} eventList array of events to subscribe
 * @param {Contract} contract Ether Contract instance
 * @param {bool} fromNow Exclude past event blocks
 * 
 * DOCS:
 * https://www.coinclarified.com/p/3-ways-to-subscribe-to-events-with-web3-js/
 * https://docs.ethers.io/v5/api/contract/contract/#Contract-queryFilter
 * 
 * @returns callback to remove all listeners
 */
export default function registerListener(callback, eventList, contract, fromNow = false){  
  
  if (!contract) 
    throw new eventHandlerException("Invalid argument: contract can not be null", "useInteractorError")
  
  if (typeof(callback) !== 'function') 
    throw new eventHandlerException("Invalid argument: callback should be a function", "useInteractorError")
  
  if (typeof(eventList) !== 'object' || !eventList.length ) 
    throw new eventHandlerException("Invalid argument: eventList should be an array of contract's events", "useInteractorError")
  
  const listeners = eventList.map(name => {
    const callbackWrapper = function(...args){
      /** When blockNumber exist, all minor event blocks will be ignored */
      const event = args[args.length - 1];
      if (fromNow && event.blockNumber <= contract.blockNumber) return;

      callback(...args)
    };
    
    contract.on(name, callbackWrapper)
    return { name, callbackWrapper };
  })
  
  return () => {
    listeners.map(listener => {
      contract.off(listener.name, listener.callbackWrapper)
    });
  }
};

/**
 * Interactor error
 * 
 * @param {string} message Error message
 * @param {string} name Error type
 */
function eventHandlerException(message, name) {
  this.message = message;
  this.name = name;
}
