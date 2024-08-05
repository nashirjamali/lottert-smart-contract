// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.19;

contract Lottery {
    address payable public manager;
    address payable[] public players;

    constructor() {
        manager = payable(msg.sender);
    }

    receive() external payable {
        require(msg.sender != manager, "Manager cannot register as a player");
        require(
            msg.value == 0.01 ether,
            "Must be 0.01 ETH to enter the lottery."
        );
        // Add player
        players.push(payable(msg.sender));
    }

    function getPlayers() public managerOnly view returns (address payable[] memory) {
        return players;
    }

    function randomizer() internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, block.timestamp, players)
            )
        );
    }

    function pickWinner() public managerOnly {
        require(players.length >= 3, "Must be at least 3 players");

        uint256 index = randomizer() % players.length;
        address payable winner = players[index];

        // Transfer the contract balance to the winner
        manager.transfer(address(this).balance / 10);
        winner.transfer(address(this).balance);

        // Reset the players array after picking a winner
        players = new address payable[](0);
    }

    modifier managerOnly() {
        require(msg.sender == manager, "Can only called by manager.");
        _;
    }
}
