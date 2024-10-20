// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CalendlyDApp {
    struct Appointment {
        address payable client;
        uint256 deposit;
        uint256 startTime;
        bool attended;
    }

    address payable public owner;
    uint256 public depositAmount;
    mapping(uint256 => Appointment) public appointments;
    uint256 public appointmentCount;

    event AppointmentBooked(uint256 appointmentId, address client, uint256 startTime, uint256 deposit);
    event AppointmentAttended(uint256 appointmentId, address client);
    event DepositRefunded(uint256 appointmentId, address client, uint256 deposit);

    constructor(uint256 _depositAmount) {
        owner = payable(msg.sender);
        depositAmount = _depositAmount;
    }

    // Client books an appointment by sending a deposit
    function bookAppointment(uint256 _startTime) public payable {
        require(msg.value == depositAmount, "Deposit amount not correct");

        appointmentCount++;
        appointments[appointmentCount] = Appointment({
            client: payable(msg.sender),
            deposit: msg.value,
            startTime: _startTime,
            attended: false
        });

        emit AppointmentBooked(appointmentCount, msg.sender, _startTime, msg.value);
    }

    // Mark appointment as attended by the owner
    function markAsAttended(uint256 _appointmentId) public {
        Appointment storage appointment = appointments[_appointmentId];
        require(msg.sender == owner, "Only the owner can mark attendance");
        require(appointment.startTime <= block.timestamp, "Appointment time has not yet come");

        appointment.attended = true;
        emit AppointmentAttended(_appointmentId, appointment.client);
    }

    // Refund deposit if attended or transfer to owner if missed
    function resolveAppointment(uint256 _appointmentId) public {
        Appointment storage appointment = appointments[_appointmentId];
        require(block.timestamp > appointment.startTime + 1 hours, "Appointment time not passed");
        require(appointment.client == msg.sender || msg.sender == owner, "Unauthorized");

        if (appointment.attended) {
            appointment.client.transfer(appointment.deposit);
            emit DepositRefunded(_appointmentId, appointment.client, appointment.deposit);
        } else {
            owner.transfer(appointment.deposit);
        }

        delete appointments[_appointmentId];
    }
}
