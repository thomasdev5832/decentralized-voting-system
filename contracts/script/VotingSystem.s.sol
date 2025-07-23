// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {VotingSystem} from "../src/VotingSystem.sol";

contract VotingSystemScript is Script {
    VotingSystem public votingSystem;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        address owner = msg.sender;

        votingSystem = new VotingSystem(owner);

        vm.stopBroadcast();
    }
}
