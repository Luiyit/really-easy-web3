import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import ethereumActions from '../../utils/ethereum_requests';
import ethActions from '../../utils/ethereum_requests';
import * as  wallet from '../../utils/metamask';
import * as  providers from '../../utils/providers';
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
  isMetamaskUnlocked: boolean,
  isReady: Boolean,
}

const emptyMetamaskState: IMetamaskState = {
  isMetaMaskInstalled: false,
  isMetamaskUnlocked: false,
  isReady: false,
}

interface IEthereumState {
  providerExists: boolean, 
  providersName: string[],
  isReady: Boolean,
  isMetaMaskReady: Boolean,
  isCoinbaseReady: Boolean,
}

const emptyEthereumState: IEthereumState = {
  providerExists: false,
  providersName: [],
  isReady: false,
  isMetaMaskReady: false,
  isCoinbaseReady: false,
}



interface IAcctContext extends IChainState, IMetamaskState{
  default: string;
  connect: Function,
  personalSign: Function,
  disconnect: Function,
  refreshConnection: Function,
  accounts: string[],
  loading: Boolean,
  ethereumState: IEthereumState,
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
// TODO: Default providerType [metamask, coinbase]
const AccountsProvider = ({ children, connectOnLoad, autoConnect, simulateReconnect, targetNetworkId }: IAccountProps) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState<Boolean>(true);

  const [state, setState] = useState<IState>(getInitialState());
  const [chainState, setChainState] = useState<IChainState>(emptyChainState);
  const [metamaskState, setMetamaskState] = useState<IMetamaskState>(emptyMetamaskState);
  const [ethereumState, setEthereumState] = useState<IEthereumState>(emptyEthereumState);


  const defaultAcc = state.connected ? accounts[state.defaultAccount] : '';

  // TODO: Check comp
  const eventsHandler = async (type: string, data: any) => {
    if (type === EVENTS_TYPES.ACCOUNT_CHANGED && (data || []).length) refreshConnection();
    if (type === EVENTS_TYPES.CHAIN_CHANGED) requestChainState();
    if (type === EVENTS_TYPES.MESSAGE) console.info(data);;
  }

  useEffect(() => {
    if (removeListener) removeListener = removeListener();
    if (accounts.length) removeListener = registerListener(eventsHandler);
  }, [accounts])

  useEffect(() => {
    initialize();
  }, [ethereumState.providerExists]);
  
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
    await requestMetamaskState();
    await requestEthereumState();

    if (!providers.exists())
      return setLoading(false)
    
    await requestAccounts();
    if (accounts.length) requestChainState();
  };

  const requestMetamaskState = async () => {
    const isMetaMaskInstalled = wallet.isMetaMaskInstalled();
    const isMetamaskUnlocked = await wallet.isMetamaskUnlocked();
    const isReady = isMetaMaskInstalled && isMetamaskUnlocked;
    setMetamaskState({isMetaMaskInstalled, isMetamaskUnlocked, isReady});
  }

  const requestEthereumState = async () => {
    const providerExists = providers.exists(); 
    const providersName = providers.getProviderNames();
    const isReady = await providers.isReady();
    const isMetaMaskReady = await providers.isMetaMaskReady();
    const isCoinbaseReady = await providers.isCoinbaseReady();

    const state:IEthereumState = {
      providerExists,
      providersName,
      isReady,
      isMetaMaskReady,
      isCoinbaseReady,
    }
    setEthereumState(state);
  };
  
  
  const requestChainState = async () => {
    const validEthereumChain = await ethereumActions.isValidEthereumChain(targetNetworkId);
    const currentChainId = await ethereumActions.currentChainId();
    setChainState({validEthereumChain, currentChainId});
  }

  const requestAccounts = async () => {

    // TODO
    // This logic should be change
    // const isUnlocked = await wallet.isMetamaskUnlocked();
    // if(!providers.isReady()) {
    //   setLoading(false);
    //   return observeMetamaskUnlock();
    // }

    const accounts = await ethActions.getCurrentAccounts();
    const isFakeDisconnected = storage.isFakeDisconnected();

    /** User connected + should auto connect + Is not fake disconnected */
    if((accounts && autoConnect && !isFakeDisconnected) || (!accounts && connectOnLoad)) {
      ethActions.switchEthereumChain(targetNetworkId);
      setAccounts(accounts);
      setAccountsState(accounts);
    }

    /*
     * User connected + + should auto connect + Is fake disconnected
     * User not connected + connect on page load
     */
    if(accounts && autoConnect && isFakeDisconnected && connectOnLoad){
      const accounts = await ethActions.requestAccounts(true, isFakeDisconnected && simulateReconnect, targetNetworkId);
      setAccounts(accounts);
      setAccountsState(accounts);
    }
    
    setLoading(false);
  }

  const setAccountsState = (accounts:string[] = [], fakeDisconnected:boolean = false, defaultAccount:number = 0) => {
    /** If user was able to connected, we need to reset the fake storage value */
    if (!!accounts) storage.setFake(false);
  
    /** Set connection state */
    setState(getInitialState(accounts, fakeDisconnected, defaultAccount))

  }
  
  const disconnect = (setFakeDisconnect: boolean = true) => {
    storage.setFake(setFakeDisconnect);
    setAccounts([]);
    setState(getInitialState())
  }

  const refreshConnection = async () => {
    console.info("Refresh Connection");
    // setAccounts([]);
    // connect()
  }

  const connect = async (providerType: string = '') => {
    if(!ethereumState.isReady) return;
    
    // TODO connect directly with th provider

    const isFakeDisconnected = storage.isFakeDisconnected();
    const accounts = await ethActions.requestAccounts(true, isFakeDisconnected && simulateReconnect, targetNetworkId, providerType);
    setAccounts(accounts);
    setAccountsState(accounts);
  }

  const personalSign = async (message: string) => {
    const signature = await ethActions.personalSign(message);
    return signature;
  }
  
  const contextValue: IAcctContext = {
    default: defaultAcc,
    connect, 
    disconnect, 
    personalSign,
    refreshConnection, 
    accounts, 
    ethereumState,
    ...state, 
    ...chainState,
    ...metamaskState,
    loading,
  };

  return (
    <AccountContext.Provider value={contextValue} >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountsProvider;
