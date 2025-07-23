// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol"; // Importa console para usar console.log
import {VotingSystem} from "../src/VotingSystem.sol";

// Script para realizar o deploy do contrato VotingSystem na rede Polygon Amoy Testnet
contract DeployVotingSystem is Script {
    // Função principal para executar o deploy
    function run() external {
        // Endereço do proprietário (owner) do contrato
        address owner = vm.envAddress("OWNER_ADDRESS");

        // Inicia a transmissão de transações usando a chave privada
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        // Cria uma nova instância do contrato VotingSystem
        VotingSystem votingSystem = new VotingSystem(owner);

        // Finaliza a transmissão
        vm.stopBroadcast();

        // Loga o endereço do contrato implantado
        console.log("VotingSystem implantado em:", address(votingSystem));
    }
}
