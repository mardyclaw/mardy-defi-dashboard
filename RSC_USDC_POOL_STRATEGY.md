# RSC/USDC Lending Pool Strategy

## Market Model (Based on Moonwell Pattern)

### Single Pool: RSC/USDC

**Lenders**: Supply RSC → Earn RSC APY (auto-compounded)
**Borrowers**: Borrow USDC → Pay interest + collateral (RSC)

```
Lenders Supply RSC
         ↓
    Earn RSC Base APY (auto-compounds)
    APY driven by utilization
         ↓
Higher Utilization (more USDC borrowed) = Higher RSC APY
```

---

## APY Structure

### Base APY (Auto-Compounding)
- **Earned in**: RSC token
- **Calculation**: Based on utilization rate
- **Formula**: `Utilization % × Borrow Rate = Supply APY`
- **Automatic**: No manual claiming needed

### Supply/Borrow Mechanics
1. **Supply RSC**: Get minted mRSC (interest-bearing token)
2. **mRSC grows over time** as APY compounds
3. **Borrow USDC**: Against RSC collateral (86% LLTV)
4. **Borrow rate** proportional to utilization

---

## Dashboard Features Needed

### User Supply View
```
Supply RSC
├─ Your Balance: X RSC
├─ Supplied: Y RSC
├─ Earning: Z RSC (with % APY)
├─ Action: Supply more / Withdraw
└─ Rate: Current Base APY
```

### User Borrow View
```
Borrow USDC (against RSC)
├─ Collateral Supplied: X RSC
├─ Max Borrow: Y USDC (86% of collateral value)
├─ Currently Borrowed: Z USDC
├─ Borrow Rate: X% APY
├─ Interest Owed: Amount accumulating
└─ Action: Borrow / Repay
```

### Market View
```
Market Status
├─ Total Supply: XXX RSC
├─ Total Borrow: YYY USDC
├─ Utilization: ZZ%
├─ Supply APY: A%
├─ Borrow APY: B%
├─ Oracle Price: RSC/USDC = $X.XX
└─ Last Updated: [time]
```

---

## Implementation Phases

### Phase 1: Core Contract (✅ DONE)
- [x] RSCUSDCOracle deployed
- [x] Market parameters configured
- [x] Morpho Blue integration ready

### Phase 2: Web Interface (⏳ IN PROGRESS)
- [ ] Supply/Borrow UI
- [ ] Real-time APY display
- [ ] Wallet balance tracking
- [ ] Transaction signing

### Phase 3: Live Market
- [ ] Create Morpho market on-chain
- [ ] Enable supply/borrow functions
- [ ] Monitor live APY and utilization

### Phase 4: Monitoring Dashboard
- [ ] Historical APY charts
- [ ] Utilization trends
- [ ] Top lenders/borrowers
- [ ] Risk metrics

---

## Key Advantages (vs. Moonwell)
1. **Focused**: Single pool (no portfolio spread)
2. **Transparent**: Custom oracle (Aerodrome-based)
3. **Predictable**: Fixed LLTV (86%)
4. **Efficient**: Lower fees (more to lenders)

---

## User Flow

```
New User
   ↓
Connect Wallet → See APY & Utilization
   ↓
Choose: Supply RSC or Borrow USDC
   ↓
Supply Path:
  - Approve RSC → Supply → mRSC minted
  - Watch balance grow with APY
  - Withdraw anytime
   ↓
Borrow Path:
  - Already supplied RSC as collateral
  - Approve borrowing limit
  - Borrow USDC → Interest accrues
  - Repay with interest
```

---

## Technical Requirements

1. **Frontend**: Display real-time APY, utilization, user positions
2. **Smart Contract**: Already have (Morpho Blue + Oracle)
3. **Data Source**: On-chain events (Supply/Borrow logs)
4. **Updates**: Poll Morpho contract for state changes

---

## Timeline

- **Tonight**: Dashboard with supply/borrow interface
- **Morning**: Live market creation + testing
- **Day 1**: Full monitoring dashboard
- **Day 2**: Ready for real users
