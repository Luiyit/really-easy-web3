export interface IState {
  connected: boolean, 
  fakeDisconnected: boolean,
  accountsConnected: number,
  defaultAccount: number
}

/**
 * 
 * @param accounts List of addresses
 * @param fakeDisconnected User disconnected the app (keep connected in the wallet)
 * @param defaultAccount Account to use
 * @returns IState
 */
export default function getInitialState(accounts: string[] = [], fakeDisconnected: boolean = false, defaultAccount: number = 0){
  const accountsConnected = accounts?.length || 0;
  return {
    connected: accountsConnected > 0,
    fakeDisconnected,
    accountsConnected,
    defaultAccount,
  } as IState
}