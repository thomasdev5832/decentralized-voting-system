// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {VotingSystem} from "../src/VotingSystem.sol";

contract VotingSystemTest is Test {
    VotingSystem public votingSystem;
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);

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

    /// @notice Testa o resultado de uma proposta após o prazo
    function testGetResultAfterDeadline() public {
        // Cria uma proposta
        votingSystem.createProposal("Test Proposal", "Test Description");

        // User1 vota a favor dentro do prazo
        vm.prank(user1);
        votingSystem.vote(1, true);

        // Avança o tempo para após o prazo (1 semana + 1 segundo)
        vm.warp(block.timestamp + 604801);

        // Verifica se resultado é "Aprovada"
        string memory result = votingSystem.getResult(1);
        assertEq(result, "Aprovada", "Resultado deve ser Aprovada com voto a favor");

        // Cria outra proposta para testar empate/rejeitada
        votingSystem.createProposal("Test Proposal 2", "Test Description 2");
        vm.prank(user1);
        votingSystem.vote(2, true);
        vm.prank(user2);
        votingSystem.vote(2, false);

        // Avança o tempo para após o prazo
        vm.warp(block.timestamp + 604801);

        // Verifica o resultado (empate resulta em Rejeitada)
        result = votingSystem.getResult(2);
        assertEq(result, "Rejeitada", "Resultado deve ser Rejeitada em caso de empate");
    }
}
