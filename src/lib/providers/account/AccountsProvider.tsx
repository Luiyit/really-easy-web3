import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import ethereumActions from '../../utils/ethereum_requests';
import ethActions from '../../utils/ethereum_requests';
import * as  wallet from '../../utils/metamask';
import * as storage from './storage'
import getInitialState, { IState } from './config';
import registerListener, { EVENTS_TYPES } from '../../utils/ethereum_events';

interface IChainState {
  validEthereumChain: boolean, 
  currentChainId: string
}
const emptyChainState: IChainState = {
  validEthereumChain: false,
  currentChainId: '',
}

interface IMetamaskState {
  isMetaMaskInstalled: boolean, 
  isMetamaskUnlocked: boolean
}
const emptyMetamaskState: IMetamaskState = {
  isMetaMaskInstalled: false,
  isMetamaskUnlocked: false,
}

interface IAcctContext extends IChainState, IMetamaskState{
  default: string;
  connect: Function,
  disconnect: Function,
  refreshConnection: Function,
  accounts: string[],
}

export const AccountContext = React.createContext({} as IAcctContext);
export const useAccounts = () => useContext(AccountContext);

/** Dev Note: 
 *  removeListener should be outside of the component. 
 *  If not it will depend of component life cycle and cases with two listener can be possible 
 **/
let removeListener: any = null;
let intervalId: any = null;

interface IAccountProps {
  children: any;
  connectOnLoad: boolean,
  autoConnect: boolean,
  simulateReconnect: boolean,
  targetNetworkId: string,
}

// TODO: Remove all listener on unmount
// TODO: Create Docs
const AccountsProvider = ({ children, connectOnLoad, autoConnect, simulateReconnect, targetNetworkId }: IAccountProps) => {
  const [accounts, setAccounts] = useState<string[]>([]);

  const [state, setState] = useState<IState>(getInitialState());
  const [chainState, setChainState] = useState<IChainState>(emptyChainState);
  const [metamaskState, setMetamaskState] = useState<IMetamaskState>(emptyMetamaskState);

  const defaultAcc = state.connected ? accounts[state.defaultAccount] : '';

  // TODO: Check comp
  const eventsHandler = async (type: string, data: any) => {
    if (type === EVENTS_TYPES.ACCOUNT_CHANGED && (data || []).length) refreshConnection();
    if (type === EVENTS_TYPES.CHAIN_CHANGED) requestChainState();
    if (type === EVENTS_TYPES.MESSAGE) console.log(data);;
  }

  useEffect(() => {
    if (removeListener) removeListener = removeListener();
    if (accounts.length) removeListener = registerListener(eventsHandler);
  }, [accounts])

  useEffect(() => {
    initialize();
  }, [metamaskState.isMetamaskUnlocked]);
  
  const observeMetamaskUnlock = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      const isUnlockedCaller = async() => { 
        const isUnlocked = await wallet.isMetamaskUnlocked();
        if (isUnlocked){
          clearInterval(intervalId);
          initialize();
          intervalId=null;
        }
      }
      isUnlockedCaller();
    }, 200);
  };

  const initialize = async () => {
    requestMetamaskState();
    if (!wallet.isMetaMaskInstalled()) return;
    requestAccounts();
    requestChainState();
  };

  const requestMetamaskState = async () => {
    const isMetaMaskInstalled = wallet.isMetaMaskInstalled();
    const isMetamaskUnlocked = await wallet.isMetamaskUnlocked();
    setMetamaskState({isMetaMaskInstalled, isMetamaskUnlocked});
  }
  
  const requestChainState = async () => {
    const validEthereumChain = await ethereumActions.isValidEthereumChain(targetNetworkId);
    const currentChainId = await ethereumActions.currentChainId();
    setChainState({validEthereumChain, currentChainId});
  }

  const requestAccounts = async () => {
    const isUnlocked = await wallet.isMetamaskUnlocked();
    if(!isUnlocked) return observeMetamaskUnlock();

    const accounts = await ethActions.getCurrentAccounts();
    const isFakeDisconnected = storage.isFakeDisconnected();

    /** User connected + should auto connect + Is not fake disconnected */
    if(accounts && autoConnect && !isFakeDisconnected){
      ethActions.switchEthereumChain(targetNetworkId);
      setAccounts(accounts);
    }

    /*
     * User connected + + should auto connect + Is fake disconnected
     * User not connected + connect on page load
     */
    if((accounts && autoConnect && isFakeDisconnected) || (!accounts && connectOnLoad)){
      const accounts = await ethActions.requestAccounts(true, isFakeDisconnected && simulateReconnect, targetNetworkId);
      setAccounts(accounts);
    }
    
    setAccountsState(accounts);
  }

  const setAccountsState = (accounts:string[] = [], fakeDisconnected:boolean = false, defaultAccount:number = 0) => {
    /** If user was able to connected, we need to reset the fake storage value */
    if (!!accounts) storage.setFake(false);
  
    /** Set connection state */
    setState(getInitialState(accounts, fakeDisconnected, defaultAccount))

  }
  
  const disconnect = () => {
    storage.setFake(true);
    setAccounts([]);
    setState(getInitialState())
  }

  const refreshConnection = async () => {
    setAccounts([]);
    connect()
  }

  const connect = async () => {
    const isFakeDisconnected = storage.isFakeDisconnected();
    const accounts = await ethActions.requestAccounts(true, isFakeDisconnected && simulateReconnect, targetNetworkId);
    setAccounts(accounts);
    setAccountsState(accounts);
  }
  
  const contextValue: IAcctContext = {
    default: defaultAcc,
    connect, 
    disconnect, 
    refreshConnection, 
    accounts, 
    ...state, 
    ...chainState,
    ...metamaskState,
  }
  return (
    <AccountContext.Provider value={contextValue} >
      {children}
    </AccountContext.Provider>
  );
};

// AccountsProvider.propTypes = {
//   children: PropTypes.any.isRequired,
//   connectOnLoad: PropTypes.bool,
//   autoConnect: PropTypes.bool,
//   simulateReconnect: PropTypes.bool,
//   targetNetworkId: PropTypes.string,
// };

export default AccountsProvider;
