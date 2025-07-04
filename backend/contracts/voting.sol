// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public admin;
    uint256 public pollCount;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Poll {
        uint256 id;
        string title;
        bool isOpen;
        mapping(uint256 => Candidate) candidates;
        uint256 candidatesCount;
        mapping(address => bool) voters;
    }

    mapping(uint256 => Poll) public polls;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Hanya admin yang bisa mengakses");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createPoll(string memory _title) public onlyAdmin {
        pollCount++;
        Poll storage poll = polls[pollCount];
        poll.id = pollCount;
        poll.title = _title;
        poll.isOpen = false;
        poll.candidatesCount = 0;
    }

    function addCandidate(uint256 _pollId, string memory _name) public onlyAdmin {
        Poll storage poll = polls[_pollId];
        require(!poll.isOpen, "Polling sudah dibuka, tidak bisa tambah kandidat");
        poll.candidatesCount++;
        poll.candidates[poll.candidatesCount] = Candidate(poll.candidatesCount, _name, 0);
    }

    function openPoll(uint256 _pollId) public onlyAdmin {
        polls[_pollId].isOpen = true;
    }

    function closePoll(uint256 _pollId) public onlyAdmin {
        polls[_pollId].isOpen = false;
    }

    function vote(uint256 _pollId, uint256 _candidateId) public {
        Poll storage poll = polls[_pollId];
        require(poll.isOpen, "Polling belum dibuka");
        require(!poll.voters[msg.sender], "Anda sudah melakukan voting");
        require(_candidateId > 0 && _candidateId <= poll.candidatesCount, "Kandidat tidak valid");

        poll.candidates[_candidateId].voteCount++;
        poll.voters[msg.sender] = true;
    }

    function getCandidate(uint256 _pollId, uint256 _candidateId) public view returns (string memory, uint256) {
        Candidate storage candidate = polls[_pollId].candidates[_candidateId];
        return (candidate.name, candidate.voteCount);
    }

    function getCandidatesCount(uint256 _pollId) public view returns (uint256) {
        return polls[_pollId].candidatesCount;
    }
}
