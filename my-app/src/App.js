import React, { useState, useEffect } from 'react'; // Import React hooks
import { ethers } from 'ethers'; // Import ethers.js
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null); // State to store the ethers provider

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

// Function to connect to the wallet
const connectWallet = async () => {
  try {
    // Request accounts
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    // Check if the user has connected an account
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      const ethersProvider = new ethers.providers.Web3Provider(ethereum);
      setProvider(ethersProvider);
      console.log('Wallet connected:', accounts[0]);
    } else {
      alert('Please connect a wallet.');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
  }
};

// Function to check if the wallet is already connected
const checkIfWalletConnected = async () => {
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      const ethersProvider = new ethers.providers.Web3Provider(ethereum);
      setProvider(ethersProvider);
      console.log('Wallet already connected:', accounts[0]);
    } else {
      console.log('No wallet connected');
    }
  } catch (error) {
    console.error('Error checking wallet connection:', error);
  }
};

// Function to book an appointment
const bookAppointment = async (startTime) => {
  try {
    // Check if the wallet is connected
    if (!provider || !account) {
      alert('Please connect to Coinbase Wallet first.');
      await connectWallet();  // Prompt the user to connect the wallet
      return;
    }

    const signer = provider.getSigner();
    const startTimeInt = Math.floor(startTime); // Ensure it's a whole number
    const depositAmount = ethers.utils.parseEther('0.1');
    const contractAddress = '0xafd6F378455cb58dC99485E4c18CB7C1321A7127'; // Replace with your deployed contract address
    const contractABI = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_depositAmount",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "appointmentId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "client",
            "type": "address"
          }
        ],
        "name": "AppointmentAttended",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "appointmentId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "client",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "deposit",
            "type": "uint256"
          }
        ],
        "name": "AppointmentBooked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "appointmentId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "client",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "deposit",
            "type": "uint256"
          }
        ],
        "name": "DepositRefunded",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "appointmentCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "appointments",
        "outputs": [
          {
            "internalType": "address payable",
            "name": "client",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deposit",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startTime",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "attended",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_startTime",
            "type": "uint256"
          }
        ],
        "name": "bookAppointment",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "depositAmount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_appointmentId",
            "type": "uint256"
          }
        ],
        "name": "markAsAttended",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address payable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_appointmentId",
            "type": "uint256"
          }
        ],
        "name": "resolveAppointment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    const tx = await contract.bookAppointment(startTimeInt, { value: depositAmount, gasLimit: ethers.BigNumber.from('100000') });
    await tx.wait();

    alert("Appointment booked successfully!");
  } catch (error) {
    alert(error);
    console.error("Error booking appointment:", error);
  }
};

// Check if wallet is connected on initial load
useEffect(() => {
  checkIfWalletConnected();
}, []);

return (
  <div>
    <h1>Calendly DApp with Coinbase Wallet and Polygon</h1>
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