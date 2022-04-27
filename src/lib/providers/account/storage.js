import { getLocalStorage } from '../../utils/window-storage';
/** Prevent error in incognito mode or inside iframe when if isn't available */
const localStorage = getLocalStorage();
const FAKE_DISCONNECTED = 'FAKE_DISCONNECTED';

export const isFakeDisconnected = () => {
  return localStorage.getItem(FAKE_DISCONNECTED) === 'true'
}

export const setFake = async (fakeDisconnected) => {
  const isFake = fakeDisconnected ? 'true' : 'false';
  localStorage.setItem(FAKE_DISCONNECTED, isFake);
};