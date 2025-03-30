import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define initial wallet state
const initialState = {
  wallet: {
    name: "", // Wallet name (e.g., Suiet)
    address: "", // Wallet address
    publicKey: "", // Public key
    chain: {}, // Chain details
    balance: 0, // Wallet balance
    connected: false, // Connection status
  },
  lastUpdated: Date.now(), // Track last activity time
};

const useWalletStore = create(
  persist(
    (set, get) => {
      const updateState = (newState) => {
        set({ ...newState, lastUpdated: Date.now() });
      };

      return {
        ...initialState,

        // Connect and update wallet data
        connectWallet: (walletData) =>
          updateState({ wallet: { ...walletData, connected: true } }),

        // Disconnect wallet
        disconnectWallet: () => updateState({ wallet: initialState.wallet }),

        // Update balance
        updateBalance: (balance) => {
          set((state) => ({
            wallet: { ...state.wallet, balance },
            lastUpdated: Date.now(),
          }));
        },

        checkExpiration: () => {
          const state = get();
          const timeDiff = Date.now() - state.lastUpdated;
          const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
          if (timeDiff > oneDay) {
            set({ wallet: initialState.wallet, lastUpdated: Date.now() });
          }
        },
      };
    },
    {
      name: "sui-wallet-store", // Key for localStorage
      getStorage: () => localStorage, // Use localStorage
    }
  )
);

// Run expiration check on store initialization
useWalletStore.getState().checkExpiration();

export default useWalletStore;
