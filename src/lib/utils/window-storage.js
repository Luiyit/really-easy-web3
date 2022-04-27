const fakeStorage = {
  setItem: () => { },
  getItem: () => null,
  removeItem: () => { },
};

/**
 * Test if the local storage is available
 *
 * @returns true if any erorr is raised, otherwise false
 */
export const isLocalStorageAvailable = () => {
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Retrive localStorage
 *
 * @returns storage or fake object
 */
export const getLocalStorage = () =>
  isLocalStorageAvailable() ? localStorage : fakeStorage;
