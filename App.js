import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xafd6F378455cb58dC99485E4c18CB7C1321A7127'; // Replace with your deployed contract address
const ABI = [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint256","name":"totalSupply","type":"uint256"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];


function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      setProvider(provider);
      setContract(contract);

      const signer = provider.getSigner();
      const account = await signer.getAddress();
      setAccount(account);

      const deposit = await contract.depositAmount();
      setDepositAmount(ethers.utils.formatEther(deposit.toString()));
    }
  };

  const bookAppointment = async (startTime) => {
    const signer = provider.getSigner();
    const tx = await contract.connect(signer).bookAppointment(startTime, {
      value: ethers.utils.parseEther(depositAmount)
    });
    await tx.wait();
    alert('Appointment booked!');
  };

  const markAsAttended = async (appointmentId) => {
    const signer = provider.getSigner();
    const tx = await contract.connect(signer).markAsAttended(appointmentId);
    await tx.wait();
    alert('Marked as attended!');
  };

  const resolveAppointment = async (appointmentId) => {
    const signer = provider.getSigner();
    const tx = await contract.connect(signer).resolveAppointment(appointmentId);
    await tx.wait();
    alert('Appointment resolved!');
  };

  return (
    <div>
      <h1>Calendly DApp</h1>
      <p>Connected Account: {account}</p>
      <h2>Book Appointment</h2>
      <button onClick={() => bookAppointment(Date.now() / 1000 + 3600)}>Book for Next Hour</button>
      
      <h2>Resolve Appointments</h2>
      {/* Add a list of appointments and buttons to resolve them */}
      {appointments.map(appointment => (
        <div key={appointment.id}>
          <p>Appointment {appointment.id}: {new Date(appointment.startTime * 1000).toLocaleString()}</p>
          <button onClick={() => resolveAppointment(appointment.id)}>Resolve</button>
        </div>
      ))}
    </div>
  );
}

export default App;