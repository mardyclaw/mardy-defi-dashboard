// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../RSCUSDCOracle.sol";

contract DeployOracle is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the oracle
        RSCUSDCOracle oracle = new RSCUSDCOracle();
        
        console.log("Oracle deployed at:", address(oracle));
        
        vm.stopBroadcast();
    }
}
