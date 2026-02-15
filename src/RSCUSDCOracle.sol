// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RSC/USDC Oracle for Morpho Blue
 * @notice Custom oracle that sources RSC/USDC price from Aerodrome pool on Base
 * @dev Implements IOracle interface for Morpho Blue markets
 */

interface IAerodromePair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IOracle {
    function price() external view returns (uint256);
}

contract RSCUSDCOracle is IOracle {
    // Aerodrome RSC/USDC pool on Base
    IAerodromePair public constant AERODROME_POOL = IAerodromePair(0x6cCa90E732942D73c276F73b805cA2948f6B3018);
    
    // Token addresses on Base
    address public constant RSC = 0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1;
    address public constant USDC = 0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d; // Standard USDC on Base
    
    // Constants for price calculation
    uint256 public constant RSC_DECIMALS = 18;
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant SCALE = 1e36; // For 18 decimal precision in Morpho

    /**
     * @notice Returns the price of 1 RSC in USDC (18 decimals)
     * @dev Required by IOracle interface
     * @return The price with 18 decimal precision
     */
    function price() public view override returns (uint256) {
        (uint112 reserve0, uint112 reserve1,) = AERODROME_POOL.getReserves();
        
        address token0 = AERODROME_POOL.token0();
        
        // Determine which reserve is RSC and which is USDC
        uint256 rscReserve;
        uint256 usdcReserve;
        
        if (token0 == RSC) {
            rscReserve = uint256(reserve0);
            usdcReserve = uint256(reserve1);
        } else {
            rscReserve = uint256(reserve1);
            usdcReserve = uint256(reserve0);
        }
        
        // Calculate price: (USDC Reserve / RSC Reserve) * 10^(RSC_DECIMALS - USDC_DECIMALS)
        // Result is price of 1 RSC in USDC with 18 decimal precision
        uint256 priceRaw = (usdcReserve * 10**RSC_DECIMALS) / rscReserve;
        
        // Normalize to 18 decimals for Morpho
        uint256 priceMorpho = priceRaw * 10**(18 - USDC_DECIMALS);
        
        return priceMorpho;
    }

    /**
     * @notice Converts and returns price for Morpho Blue format
     * @return The price quoted as collateral/loan (RSC/USDC)
     */
    function price(bytes calldata) external view returns (uint256) {
        return price();
    }
}
