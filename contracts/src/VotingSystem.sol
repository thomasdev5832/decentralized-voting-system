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

    // @notice Tipos de voto
    enum VoteType {
        NONE,
        FOR,
        AGAINST
    }
    /// @notice Estrutura da proposta
    /// @param id único da proposta
    /// @param title Título da proposta
    /// @param description Descrição da proposta
    /// @param votesFor Contador de votos a favor
    /// @param votesAgainst Contador de votos contra
    /// @param active Proposta ativa ou encerrada
    /// @param deadline Timestamp de expiração da proposta
    /// @dev A deadline é definida como o timestamp atual + duração da votação

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool active;
        uint256 deadline;
    }

    /*///////////////////////////////////
                Variables
    ///////////////////////////////////*/

    /// @notice Duração da votação em segundos
    /// @dev Definida como 1 semana (604800 segundos)
    uint256 public constant VOTING_DURATION = 604800;

    /// @notice Contador de propostas criadas
    /// @dev Incrementa a cada nova proposta criada, usado como ID único
    uint256 public proposalCount;

    /// @notice Mapeia o ID da proposta para a estrutura Proposal
    /// @dev Armazena todas as propostas criadas
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
        // Incrementa o contador de propostas para ser o ID unico da nova proposta
        proposalCount++;

        // Cria nova proposta e armazena no mapeamento
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            active: true,
            deadline: block.timestamp + VOTING_DURATION
        });

        // evento de criação da proposta
        emit ProposalCreated(proposalCount, _title, _description);
    }

    /// @notice Permite votar a favor (true) ou contra (false) uma proposta
    /// @param _proposalId ID da proposta a ser votada
    /// @param support true = a favor, false = contra
    function vote(uint256 _proposalId, bool support) external {
        // Verifica se a proposta está ativa
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.active, "Proposta encerrada");
        // Veirfica se a proposta não expirou
        require(block.timestamp <= proposal.deadline, "Prazo de votacao expirado");

        // Verifica se o usuário ainda não votou nessa proposta!
        require(votes[_proposalId][msg.sender] == VoteType.NONE, "Ja votou nessa proposta");

        // Registra o voto e incrementa contadores
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
