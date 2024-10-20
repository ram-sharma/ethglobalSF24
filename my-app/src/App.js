import React, { useState, useEffect } from 'react'; // Import React hooks
import { ethers } from 'ethers'; // Import ethers.js
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null); // State to store the ethers provider

  // Coinbase Wallet setup
  const APP_NAME = 'dAppointments with Polygon';
  const APP_LOGO_URL = 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=035';  // Replace with your logo
  const DEFAULT_CHAIN_ID = 80002;  // Polygon Amoy Testnet
  const DEFAULT_ETH_JSONRPC_URL = 'https://rpc-amoy.polygon.technology/';  // Amoy Testnet RPC URL

  const wallet = new CoinbaseWalletSDK({
    appName: APP_NAME,
    appLogoUrl: APP_LOGO_URL,
    darkMode: false,
  });

  const ethereum = wallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID);

  // Function to connect to MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Request account access if needed
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Create ethers.js provider
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);

        console.log('Connected to MetaMask:', accounts[0]);
      } catch (error) {
        console.error('User rejected MetaMask connection:', error);
        alert('Connection to MetaMask was rejected.');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask and try again.');
    }
  };

  // Function to check if MetaMask is already connected
  const checkMetaMaskConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);

        // Create ethers.js provider if already connected
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);
        
        console.log('MetaMask is already connected:', accounts[0]);
      }
    }
  };

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
      const depositAmount = ethers.utils.parseEther('0.01');
      const balance = await provider.getBalance(account);
      if (balance.lt(depositAmount)) {
        alert('Insufficient funds to cover the deposit and gas fees.');
        return;
      }

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
      const tx = await contract.bookAppointment(startTimeInt, { value: depositAmount, gasLimit: ethers.BigNumber.from('500000') });
      await tx.wait();
    } catch (error) {
      console.log(error);
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction rejected by the user.');
      } else {
        console.error('Error booking appointment:', error);
        alert('Failed to book appointment.');
      }
    }
  };

  // Check if wallet is connected on initial load
  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  const nounImageUrl = 'https://noun-api.com/beta/pfp?head=169&glasses=11'; // Noun image URL

  return (
    <div>
      <h1>Calendly DApp with Coinbase Wallet and Polygon</h1>
      <img src={nounImageUrl} alt="Noun Avatar" style={{ width: '200px', height: '200px' }} />
      <h2>MetaMask Wallet: </h2>
      <button onClick={connectMetaMask}>
        {account ? `Connected: ${account}` : 'Connect MetaMask'}
      </button>
      <h2>Coinbase Wallet: </h2>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account}` : 'Connect Coinbase Wallet'}
      </button>
      <h2>Next Available Appointment:</h2>
      <button onClick={() => bookAppointment(Date.now() / 1000 + 3600)}>
        Book Appointment for Next Hour
      </button>
      {/* <p>🎉 Appointment Booked Success!</p>
      WARNING: FAKE SUCCESS MSG: This is a placeholder while I debug */}
    </div>
  );
}

export default App;