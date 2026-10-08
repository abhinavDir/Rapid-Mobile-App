let AsyncStorage = null;
try {
  const mod = require('@react-native-async-storage/async-storage');
  AsyncStorage = mod && mod.default ? mod.default : mod;
} catch (e) {
  console.warn('AsyncStorage native module not available, using in-memory fallback');
}

// In-memory cache for synchronous access where needed
const memoryCache = new Map();

export const storage = {
  async init() {
    try {
      if (
        AsyncStorage &&
        typeof AsyncStorage.getAllKeys === 'function' &&
        typeof AsyncStorage.multiGet === 'function'
      ) {
        const keys = await AsyncStorage.getAllKeys();
        if (Array.isArray(keys) && keys.length > 0) {
          const pairs = await AsyncStorage.multiGet(keys);
          if (Array.isArray(pairs)) {
            pairs.forEach((pair) => {
              if (Array.isArray(pair) && pair[0] && pair[1] !== null && pair[1] !== undefined) {
                memoryCache.set(pair[0], pair[1]);
              }
            });
          }
        }
      }
    } catch (e) {
      console.warn('Storage init fallback:', e);
    }
  },

  getItem(key) {
    return memoryCache.get(key) || null;
  },

  async getItemAsync(key) {
    try {
      if (AsyncStorage && AsyncStorage.getItem) {
        const val = await AsyncStorage.getItem(key);
        if (val !== null) memoryCache.set(key, val);
        return val;
      }
    } catch (e) {}
    return memoryCache.get(key) || null;
  },

  async setItem(key, value) {
    try {
      const strVal = typeof value === 'string' ? value : JSON.stringify(value);
      memoryCache.set(key, strVal);
      if (AsyncStorage && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, strVal);
      }
    } catch (e) {
      console.warn('Storage setItem fallback:', e);
    }
  },

  async removeItem(key) {
    try {
      memoryCache.delete(key);
      if (AsyncStorage && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {}
  },

  async clear() {
    try {
      memoryCache.clear();
      if (AsyncStorage && AsyncStorage.clear) {
        await AsyncStorage.clear();
      }
    } catch (e) {}
  },
};

export default storage;
