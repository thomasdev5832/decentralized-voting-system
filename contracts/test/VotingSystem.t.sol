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

    /// @notice Teste para verificar se a proposta dura 1 semana
    function testProposalDuration() public {
        // Cria uma proposta
        votingSystem.createProposal("Test Proposal", "Test Description");
        // Verifica se a proposta foi criada com o prazo correto
        (,,,,, uint256 deadline,) = votingSystem.proposals(1);
        assertEq(deadline, block.timestamp + 604800, "Prazo da proposta deve ser 1 semana");
    }

    /// @notice Teste se o usuario já votou na proposta
    function testUserAlreadyVoted() public {
        // Cria uma proposta
        votingSystem.createProposal("Test Proposal", "Test Description");

        // User1 vota a favor
        vm.prank(user1);
        votingSystem.vote(1, true);

        // User1 tenta votar novamente e recebe erro
        vm.prank(user1);
        vm.expectRevert("Ja votou nessa proposta");
        votingSystem.vote(1, false);
    }

    /// @notice Teste se qualquer pessoa pode consultar votos “a favor” e “contra”
    function testAnyoneCanConsultVotes() public {
        // Cria uma proposta
        votingSystem.createProposal("Test Proposal", "Test Description");

        // User1 vota a favor
        vm.prank(user1);
        votingSystem.vote(1, true);

        // User2 tenta consultar os votos
        vm.prank(user2);
        (,,, uint256 votesFor, uint256 votesAgainst,,) = votingSystem.proposals(1);
        assertEq(votesFor, 1, "Votos a favor devem ser 1");
        assertEq(votesAgainst, 0, "Votos contra devem ser 0");
    }

    /// @notice Testa o resultado de uma proposta após o prazo
    function testGetResultAfterDeadline() public {
        // Cria uma proposta
        votingSystem.createProposal("Test Proposal", "Test Description");

        // User1 vota a favor dentro do prazo
        vm.prank(user1);
        votingSystem.vote(1, true);

        // Verifica o resultado antes do prazo
        (,,, uint256 votesFor, uint256 votesAgainst,, VotingSystem.ResultType result) = votingSystem.proposals(1);
        assertEq(votesFor, 1, "Votos a favor devem ser 1");
        assertEq(votesAgainst, 0, "Votos contra devem ser 0");
        assertEq(uint256(result), uint256(VotingSystem.ResultType.APPROVED), "Resultado deve ser APPROVED");

        // Avança o tempo para após o prazo (1 semana + 1 segundo)
        vm.warp(block.timestamp + 604801);

        // Verifica se resultado é "Aprovada"
        string memory resultStr = votingSystem.getResult(1);
        assertEq(resultStr, "Aprovada", "Resultado deve ser Aprovada com voto a favor");

        // Cria outra proposta para testar empate/rejeitada
        votingSystem.createProposal("Test Proposal 2", "Test Description 2");
        vm.prank(user1);
        votingSystem.vote(2, true);
        vm.prank(user2);
        votingSystem.vote(2, false);

        // Verifica o resultado antes do prazo (empate)
        (,,, votesFor, votesAgainst,, result) = votingSystem.proposals(2);
        assertEq(votesFor, 1, "Votos a favor devem ser 1");
        assertEq(votesAgainst, 1, "Votos contra devem ser 1");
        assertEq(uint256(result), uint256(VotingSystem.ResultType.REJECTED), "Resultado deve ser REJECTED em empate");

        // Avança o tempo para após o prazo
        vm.warp(block.timestamp + 604801);

        // Verifica o resultado (empate resulta em Rejeitada)
        resultStr = votingSystem.getResult(2);
        assertEq(resultStr, "Rejeitada", "Resultado deve ser Rejeitada em caso de empate");
    }
}
