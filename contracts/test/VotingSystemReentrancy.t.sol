// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {VotingSystem} from "../src/VotingSystem.sol";

// Contrato que simula um atacante malicioso para testar reentrância
contract MaliciousAttacker {
    VotingSystem public votingSystem; // Referência ao contrato VotingSystem
    uint256 public attackCount; // Contador de tentativas de ataque

    // Construtor que inicializa o endereço do contrato VotingSystem
    constructor(address _votingSystem) {
        votingSystem = VotingSystem(_votingSystem);
    }

    // Função para tentar criar uma proposta e simular reentrância
    function attackCreateProposal() external {
        attackCount++; // Incrementa o contador de tentativas
        votingSystem.createProposal("Attack", string(abi.encodePacked("Attack ", attackCount))); // Cria uma proposta com descrição única
    }

    // Função para tentar votar em uma proposta e simular reentrância
    function attackVote(uint256 proposalId) external {
        attackCount++; // Incrementa o contador de tentativas
        votingSystem.vote(proposalId, true); // Vota a favor da proposta
    }

    // Função chamada externamente para tentar reentrância
    function onReentrancy() external {
        if (attackCount < 2) {
            this.attackCreateProposal(); // Tenta chamar createProposal novamente para simular reentrância
        }
    }

    // Função fallback para capturar chamadas externas e tentar reentrância
    fallback() external {
        if (attackCount < 2) {
            this.attackCreateProposal(); // Tenta criar outra proposta durante a reentrância
        }
    }
}

// Contrato de teste para verificar a proteção contra reentrância no VotingSystem
contract VotingSystemReentrancyTest is Test {
    VotingSystem public votingSystem; // Instância do contrato VotingSystem
    MaliciousAttacker public attacker; // Instância do contrato atacante
    address public owner = address(0x1); // Endereço do proprietário
    address public user = address(0x2); // Endereço de um usuário comum

    // Configuração inicial do ambiente de teste
    function setUp() public {
        votingSystem = new VotingSystem(owner); // Cria uma nova instância do VotingSystem com o proprietário
        attacker = new MaliciousAttacker(address(votingSystem)); // Cria uma instância do atacante
    }

    // Testa a proteção contra reentrância na função createProposal
    function testCreateProposalReentrancy() public {
        // Cria uma proposta normal pelo proprietário
        vm.prank(owner);
        votingSystem.createProposal("Normal", "Proposal");

        // Simula um ataque de reentrância pelo atacante
        vm.prank(address(attacker));
        (bool success,) = address(votingSystem).call(
            abi.encodeWithSelector(votingSystem.createProposal.selector, "Attack", "Description")
        );

        // Verifica se a transação foi bem-sucedida (nonReentrant impede reentrância)
        assertTrue(success, "A transacao deve ser bem-sucedida devido a protecao contra reentrancia");

        // Verifica se apenas uma proposta adicional foi criada
        assertEq(votingSystem.proposalCount(), 2, "Apenas uma proposta adicional deve ser criada");

        // Verifica se não foram criadas propostas extras devido à reentrância
        (uint256 id,,,,,,) = votingSystem.proposals(2);
        assertEq(id, 2, "O ID da segunda proposta deve ser 2");
    }

    // Testa a proteção contra reentrância na função vote
    function testVoteReentrancy() public {
        // Cria uma proposta para testar a votação
        vm.prank(owner);
        votingSystem.createProposal("Vote Test", "Description");

        // Simula um ataque de reentrância pelo atacante ao votar
        vm.prank(address(attacker));
        (bool success,) = address(votingSystem).call(abi.encodeWithSelector(votingSystem.vote.selector, 1, true));

        // Verifica se a transação foi bem-sucedida (nonReentrant impede reentrância)
        assertTrue(success, "A transacao deve ser bem-sucedida devido a protecao contra reentrancia");

        // Verifica se apenas um voto foi registrado
        (,,, uint256 votesFor,,,) = votingSystem.proposals(1);
        assertEq(votesFor, 1, "Apenas um voto deve ser registrado");
    }
}
