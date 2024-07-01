import "./App.scss";
import Header from "./components/header";
import Token from "./components/token";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";

const sepoliaWithRPC = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [
        process.env.REACT_APP_RPC_URL_1,
        process.env.REACT_APP_RPC_URL_2,
        process.env.REACT_APP_RPC_URL_3,
      ],
    },
  },
  // rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/jIGX7Mqs5libwXKzRJNWee7Y7OhIBTU6', 'https://eth-sepolia.g.alchemy.com/v2/zrGU82BmjO9D0dONaGDekKra0uQOaMmM', "https://1rpc.io/sepolia"]
};

export const config = getDefaultConfig({
  appName: "REV Token",
  projectId: process.env.REACT_APP_PROJECT_ID,
  chains: [mainnet, sepoliaWithRPC],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        trustWallet,
        walletConnectWallet,
        injectedWallet,
      ],
    },
  ],
  ssr: true,
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="App">
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={true}
              newestOnTop={false}
              closeOnClick
              draggable
              pauseOnHover
              theme="colored"
            />
            <Header />
            <Token />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
