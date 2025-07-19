// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {VotingSystem} from "../src/VotingSystem.sol";

contract VotingSystemTest is Test {
    VotingSystem public votingSystem;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        votingSystem = new VotingSystem();
    }

    /// @notice Testa se votos após o prazo são recusados
    function testVotesAfterDeadline() public {
        // Cria uma proposta
        votingSystem.createProposal("Test Proposal", "Test Description");

        // Avança para 1 semana + 1 segundo
        vm.warp(block.timestamp + 604801);

        // user1 tenta votar e recebe erro
        vm.prank(user1);
        vm.expectRevert("Prazo de votacao expirado");
        votingSystem.vote(1, true);
    }
}
