import React, { useState } from 'react';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

function App() {
  const [account, setAccount] = useState(null);
  const [ethereumProvider, setEthereumProvider] = useState(null);

  const APP_NAME = 'dAppointments with Polygon';
  const APP_LOGO_URL = 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=035';  // Replace with your logo
  const DEFAULT_CHAIN_ID = 80002;  // Polygon Mumbai Testnet
  const DEFAULT_ETH_JSONRPC_URL = 'https://rpc-amoy.polygon.technology/';  // Mumbai Testnet RPC URL

  const wallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    appLogoUrl: APP_LOGO_URL,
    darkMode: false,
  });

  const ethereum = wallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);

  // Function to connect to Coinbase Wallet
  const connectWallet = async () => {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setEthereumProvider(ethereum);
      console.log('Wallet connected:', accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Function to book an appointment (without ethers.js)
  const bookAppointment = async (startTime) => {
    if (!ethereumProvider || !account) {
      alert('Please connect to Coinbase Wallet first.');
      return;
    }

    try {
      const depositAmount = '100000000000000000'; // 0.1 MATIC in wei (1 MATIC = 1e18 wei)
      const contractAddress = '0xafd6F378455cb58dC99485E4c18CB7C1321A7127'; // Replace with your deployed contract address
      const contractABI = [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"totalSupply","type":"uint256"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
      // Create contract object
      const contract = new ethereumProvider.eth.Contract(contractABI, contractAddress);

      // Send the transaction
      const tx = await contract.methods.bookAppointment(startTime).send({
        from: account,
        value: depositAmount
      });

      console.log("Transaction successful:", tx);
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment.");
    }
  };

  return (
    <div>
      <h1>Calendly DApp with Coinbase Wallet (No Ethers.js)</h1>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account}` : 'Connect Coinbase Wallet'}
      </button>

      <button onClick={() => bookAppointment(Date.now() / 1000 + 3600)}>
        Book Appointment for Next Hour
      </button>
    </div>
  );
}

export default App;
