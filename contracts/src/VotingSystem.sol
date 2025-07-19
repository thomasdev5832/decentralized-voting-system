// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/*///////////////////////////////////
            Imports
///////////////////////////////////*/

/*///////////////////////////////////
           Interfaces
///////////////////////////////////*/

/*///////////////////////////////////
           Libraries
///////////////////////////////////*/

contract VotingSystem {
    /*///////////////////////////////////
            Type declarations
    ///////////////////////////////////*/

    // tipos de voto: nenhum, a favor ou contra
    enum VoteType {
        NONE,
        FOR,
        AGAINST
    }

    // Estrutura que define uma proposta
    struct Proposal {
        uint256 id; // ID único da proposta
        string title; // Título da proposta
        string description; // Descrição da proposta
        uint256 votesFor; // Contador de votos a favor
        uint256 votesAgainst; // Contador de votos contra
        bool active; // proposta ativa ou encerrada
    }

    /*///////////////////////////////////
                Variables
    ///////////////////////////////////*/

    // Contador total de propostas
    uint256 public proposalCount;

    // Mapeia ID da proposta para a struct da proposta
    mapping(uint256 => Proposal) public proposals;

    // Mapeia: ID da proposta => endereço do votante => tipo de voto
    mapping(uint256 => mapping(address => VoteType)) private votes;

    /*///////////////////////////////////
                Events
    ///////////////////////////////////*/

    // Evento disparado quando uma nova proposta é criada
    event ProposalCreated(uint256 id, string title, string description);

    // Evento disparado quando um voto é realizado
    event VoteReceived(uint256 proposalId);

    /*///////////////////////////////////
                Errors
    ///////////////////////////////////*/

    /*///////////////////////////////////
                Modifiers
    ///////////////////////////////////*/

    /*///////////////////////////////////
                Functions
    ///////////////////////////////////*/

    /*///////////////////////////////////
                constructor
    ///////////////////////////////////*/

    /*///////////////////////////////////
            Receive&Fallback
    ///////////////////////////////////*/

    /*///////////////////////////////////
                external
    ///////////////////////////////////*/

    /// @notice Cria uma nova proposta com título e descrição
    /// @param _title Título da proposta
    /// @param _description Descrição da proposta
    function createProposal(string memory _title, string memory _description) external {
        // Incrementa o contador de propostas para ser o ID da nova proposta
        proposalCount++;

        // Cria nova proposta e armazena no mapeamento
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            active: true
        });

        // evento de criação da proposta
        emit ProposalCreated(proposalCount, _title, _description);
    }

    /// @notice Permite votar a favor (true) ou contra (false) uma proposta
    /// @param _proposalId ID da proposta a ser votada
    /// @param support true = a favor, false = contra
    function vote(uint256 _proposalId, bool support) external {
        // se a proposta está ativa
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.active, "Proposta encerrada");

        // Garante que o usuário ainda não votou nessa proposta!
        require(votes[_proposalId][msg.sender] == VoteType.NONE, "Ja votou nessa proposta");

        // Registra o voto e atualiza contadores
        if (support) {
            proposal.votesFor++;
            votes[_proposalId][msg.sender] = VoteType.FOR;
        } else {
            proposal.votesAgainst++;
            votes[_proposalId][msg.sender] = VoteType.AGAINST;
        }

        // evento de voto
        emit VoteReceived(_proposalId);
    }

    /*///////////////////////////////////
                public
    ///////////////////////////////////*/

    /// @notice Resultado atual de uma proposta
    /// @param _proposalId id da proposta
    /// @return string Resultado: "Aprovada" ou "Rejeitada"
    function getResult(uint256 _proposalId) public view returns (string memory) {
        // se a proposta está ativa
        Proposal memory proposal = proposals[_proposalId];
        require(proposal.active, "Proposta encerrada");

        // se  votesFor > votesAgainst = "Aprovada", senão "Rejeitada"
        if (proposal.votesFor > proposal.votesAgainst) {
            return "Aprovada";
        } else {
            return "Rejeitada";
        }
    }

    /*///////////////////////////////////
                internal
    ///////////////////////////////////*/

    /*///////////////////////////////////
                private
    ///////////////////////////////////*/

    /*///////////////////////////////////
                View & Pure
    ///////////////////////////////////*/
}
