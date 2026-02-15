// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

interface IOracle {
    function price() external view returns (uint256);
}

interface IMorpho {
    function createMarket(
        address loanToken,
        address collateralToken,
        address oracle,
        address irm,
        uint256 lltv
    ) external returns (bytes32);
}

contract CreateMarket is Script {
    // Base Sepolia addresses
    address constant MORPHO = 0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB;
    address constant RSC = 0xfbb75a59193a3525a8825bebe7d4b56899e2f7e1;
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b1566469c3d;
    address constant IRM = 0x870aC11D48B15DB9cb46b394e6f221Fda4836eaa; // AdaptiveCurveIrm on Base Sepolia
    uint256 constant LLTV = 0.86e18; // 86%

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address oracle = vm.envAddress("ORACLE_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);

        IMorpho morpho = IMorpho(MORPHO);
        bytes32 marketId = morpho.createMarket(RSC, USDC, oracle, IRM, LLTV);
        
        console.log("Market created with ID:");
        console.logBytes32(marketId);
        
        vm.stopBroadcast();
    }
}
