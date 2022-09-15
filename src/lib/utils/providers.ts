declare var window: any;

export const exists = (): boolean => {
  const { ethereum } = window;
  return Boolean(ethereum);
};

export enum providersType {
  metamask = "isMetaMask",
  coinbase = "isCoinbaseWallet",
};

export const getProviderNames = () : string[] => {
  if(!exists()) return [];

  const { ethereum } = window;
  let providers = [ethereum]
  if (ethereum.providers) providers = ethereum.providers;
  const providersName: string[] = [];

  providers.forEach(provider => {
    if (provider[providersType.metamask]) providersName.push("metamask");
    if (provider[providersType.coinbase]) providersName.push("coinbase");
  });

  return providersName;
};

export const getProviders = () => {
  
  if(!exists()) return [];

  const { ethereum } = window;
  let providers = [ethereum]
  if (ethereum.providers) providers = ethereum.providers;
  
  return providers;
};

export const getProvider = (providerName: providersType) => {
  
  let providers = getProviders();
    
  return providers.find(provider => {
    if (provider[providerName]) return provider;
  });
};

export const isReady = async (): Promise<boolean> => {
  const metamaskReady = await isMetaMaskReady();
  const coinbaseReady = await isCoinbaseReady();

  return metamaskReady || coinbaseReady;
}

export const isCoinbaseReady = async (): Promise<boolean> => {
  if (!exists()) return false;

  const coinbaseProvider = getProvider(providersType.coinbase);
  return Boolean(coinbaseProvider);
}

export const isMetaMaskReady = async (): Promise<boolean> => {
  if (!exists()) return false;

  const metamaskProvider = getProvider(providersType.metamask);
  if (!metamaskProvider) return false;
  
  /*
   * MetaMask warning: 
   * 'ethereum._metamask' exposes non-standard, experimental methods. They may be removed or changed without warning.
   */
  try {
    const isUnlocked = await metamaskProvider._metamask.isUnlocked();
    return isUnlocked;
  } catch (error) {
    return false;
  }
};