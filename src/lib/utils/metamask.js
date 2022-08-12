// TODO!: Change it 
// IsEthereumProviderInstalled
// ProviderName = [Metamask - Coinbase Wallet]
// Take a look into providers when the prop exists
export const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;
  // return Boolean(ethereum && ethereum.isMetaMask);
  return Boolean(ethereum);
};

// TODO! Update this file to considered other providers
export const isMetamaskUnlocked = async () => {
  if (!isMetaMaskInstalled()) return;

  if(!window.ethereum?.isMetaMask) return true;
  
  /*
   * MetaMask warning: 
   * 'ethereum._metamask' exposes non-standard, experimental methods. They may be removed or changed without warning.
   */
  try {
    const isUnlocked = await window.ethereum._metamask.isUnlocked();
    return isUnlocked;
  } catch (error) {
    return false
  }
};