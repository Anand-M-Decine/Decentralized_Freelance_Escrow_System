
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract TrustlessEscrow 
{
    address public client;
    address public freelancer;
    uint256 public amount;

    enum State {Created, Funded, Submitted, Approved, Disputed} State public state;

    constructor(address _freelancer)
    {
        client = msg.sender;
        freelancer = _freelancer;
        state = State.Created;
    }

    function fund() public payable 
    {
        require(msg.sender == client, "Only client can fund");
        require(state == State.Created, "Already Funded");
        require(msg.value > 0, "Must Send ETH");

        amount = msg.value;
        state = State.Funded;
    }

    function submitWork() public 
    {
        require(msg.sender == freelancer, "Only freelancer can submit work");
        require(state == State.Funded, "Not Funded Yet");
        
        state = State.Submitted;
    }

    function approve() public 
    {
        require(msg.sender == client, "Only client can approve");
         require(state == State.Submitted, "Work not submitted");

         state = State.Approved;

         payable(freelancer).transfer(amount);
    }

    function dispute() public 
    {
        require(msg.sender == client, "Only client can dispute");
        require(state == State.Submitted, "Can dispute only after submission");

        state = State.Disputed;
    }
}