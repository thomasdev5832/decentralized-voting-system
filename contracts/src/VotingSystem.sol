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
        FOR,
        AGAINST
    }
    // @notice Tipos de resultado da proposta
    enum ResultType {
        APPROVED,
        REJECTED
    }

    /// @notice Estrutura da proposta
    /// @param id único da proposta
    /// @param title Título da proposta
    /// @param description Descrição da proposta
    /// @param votesFor Contador de votos a favor
    /// @param votesAgainst Contador de votos contra
    /// @param deadline Timestamp de expiração da proposta
    /// @param result Resultado da proposta (Aprovada ou Rejeitada) - Inicia como Rejeitada
    /// @dev A deadline é definida como o timestamp atual + duração da votação

    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        ResultType result;
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

    /// @notice Mapeia: ID da proposta => endereço do votante => se já votou
    mapping(uint256 => mapping(address => bool)) private hasVoted;

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
            deadline: block.timestamp + VOTING_DURATION,
            result: ResultType.REJECTED
        });

        // evento de criação da proposta
        emit ProposalCreated(proposalCount, _title, _description);
    }

    /// @notice Permite votar a favor (true) ou contra (false) uma proposta
    /// @param _proposalId ID da proposta a ser votada
    /// @param support true = a favor, false = contra
    function vote(uint256 _proposalId, bool support) external {
        // Verifica se a proposta existe
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposta inexistente");
        // Veirfica se a proposta não expirou
        require(block.timestamp <= proposal.deadline, "Prazo de votacao expirado");

        // Verifica se o usuário ainda não votou nessa proposta
        require(!hasVoted[_proposalId][msg.sender], "Ja votou nessa proposta");

        // Registra o voto e incrementa contadores
        if (support) {
            proposal.votesFor++;
            votes[_proposalId][msg.sender] = VoteType.FOR;
        } else {
            proposal.votesAgainst++;
            votes[_proposalId][msg.sender] = VoteType.AGAINST;
        }

        // Marca que o usuário já votou nessa proposta
        hasVoted[_proposalId][msg.sender] = true;

        // Atualiza o resultado da proposta
        if (proposal.votesFor > proposal.votesAgainst) {
            proposal.result = ResultType.APPROVED;
        } else {
            proposal.result = ResultType.REJECTED;
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
        // Verifica se a proposta existe
        Proposal memory proposal = proposals[_proposalId];
        require(proposal.id != 0, "Proposta inexistente");

        // Retorna o resultado armazenado
        if (proposal.result == ResultType.APPROVED) {
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
