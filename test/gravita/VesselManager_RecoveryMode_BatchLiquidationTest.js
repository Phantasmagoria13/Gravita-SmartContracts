const deploymentHelper = require("../../utils/deploymentHelpers.js")
const testHelpers = require("../../utils/testHelpers.js")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

const VesselManagerTester = artifacts.require("./VesselManagerTester")

const th = testHelpers.TestHelper
const dec = th.dec
const toBN = th.toBN
const mv = testHelpers.MoneyValues

contract("VesselManager - in Recovery Mode - back to normal mode in 1 tx", async accounts => {
	const [alice, bob, carol, whale] = accounts

	let contracts

	let erc20
	let priceFeed
	let sortedVessels
	let stabilityPoolERC20
	let vesselManager
	let vesselManagerOperations

	const openVessel = async params => th.openVessel(contracts, params)

	async function deployContractsFixture() {
		contracts = await deploymentHelper.deployGravitaCore()
		contracts.vesselManager = await VesselManagerTester.new()
		contracts = await deploymentHelper.deployDebtTokenTester(contracts)
		const GRVTContracts = await deploymentHelper.deployGRVTContractsHardhat(accounts[0])

		erc20 = contracts.erc20
		priceFeed = contracts.priceFeedTestnet
		sortedVessels = contracts.sortedVessels
		stabilityPoolERC20 = contracts.stabilityPool
		vesselManager = contracts.vesselManager
		vesselManagerOperations = contracts.vesselManagerOperations

		let index = 0
		for (const acc of accounts) {
			await erc20.mint(acc, await web3.eth.getBalance(acc))
			if (++index >= 20) break
		}

		await deploymentHelper.connectCoreContracts(contracts, GRVTContracts)
		await deploymentHelper.connectGRVTContractsToCore(GRVTContracts, contracts)
	}

	beforeEach(async () => {
		await loadFixture(deployContractsFixture)
	})

	context("Batch liquidations", () => {
		const setup = async () => {
			const { collateral: A_coll_Asset, totalDebt: A_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(296, 16)),
				extraParams: { from: alice },
			})
			const { collateral: B_coll_Asset, totalDebt: B_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(280, 16)),
				extraParams: { from: bob },
			})
			const { collateral: C_coll_Asset, totalDebt: C_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(150, 16)),
				extraParams: { from: carol },
			})

			const totalLiquidatedDebt_Asset = A_totalDebt_Asset.add(B_totalDebt_Asset).add(C_totalDebt_Asset)

			await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(340, 16)),
				extraVUSDAmount: totalLiquidatedDebt_Asset,
				extraParams: { from: whale },
			})
			await stabilityPoolERC20.provideToSP(totalLiquidatedDebt_Asset, { from: whale })

			// Price drops
			await priceFeed.setPrice(erc20.address, dec(100, 18))
			const price = await priceFeed.getPrice(erc20.address)
			const TCR_Asset = await th.getTCR(contracts, erc20.address)

			// Check Recovery Mode is active
			assert.isTrue(await th.checkRecoveryMode(contracts, erc20.address))

			// Check vessels A, B are in range 110% < ICR < TCR, C is below 100%

			const ICR_A_Asset = await vesselManager.getCurrentICR(erc20.address, alice, price)
			const ICR_B_Asset = await vesselManager.getCurrentICR(erc20.address, bob, price)
			const ICR_C_Asset = await vesselManager.getCurrentICR(erc20.address, carol, price)

			assert.isTrue(ICR_A_Asset.gt(mv._MCR) && ICR_A_Asset.lt(TCR_Asset))
			assert.isTrue(ICR_B_Asset.gt(mv._MCR) && ICR_B_Asset.lt(TCR_Asset))
			assert.isTrue(ICR_C_Asset.lt(mv._ICR100))

			return {
				A_coll_Asset,
				A_totalDebt_Asset,
				B_coll_Asset,
				B_totalDebt_Asset,
				C_coll_Asset,
				C_totalDebt_Asset,
				totalLiquidatedDebt_Asset,
				price,
			}
		}

		it("First vessel only doesn’t get out of Recovery Mode", async () => {
			await setup()
			await vesselManagerOperations.batchLiquidateVessels(erc20.address, [alice])

			await th.getTCR(contracts, erc20.address)
			assert.isTrue(await th.checkRecoveryMode(contracts, erc20.address))
		})

		it("Two vessels over MCR are liquidated", async () => {
			await setup()
			const tx_Asset = await vesselManagerOperations.batchLiquidateVessels(erc20.address, [alice, bob, carol])

			const liquidationEvents_Asset = th.getAllEventsByName(tx_Asset, "VesselLiquidated")
			assert.equal(liquidationEvents_Asset.length, 3, "Not enough liquidations")

			// Confirm all vessels removed

			assert.isFalse(await sortedVessels.contains(erc20.address, alice))
			assert.isFalse(await sortedVessels.contains(erc20.address, bob))
			assert.isFalse(await sortedVessels.contains(erc20.address, carol))

			// Confirm vessels have status 'closed by liquidation' (Status enum element idx 3)

			assert.equal((await vesselManager.Vessels(alice, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
			assert.equal((await vesselManager.Vessels(bob, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
			assert.equal((await vesselManager.Vessels(carol, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
		})

		it("Stability Pool profit matches", async () => {
			const {
				A_coll,
				A_totalDebt,
				C_coll,
				C_totalDebt,
				totalLiquidatedDebt,
				A_coll_Asset,
				A_totalDebt_Asset,
				C_coll_Asset,
				C_totalDebt_Asset,
				totalLiquidatedDebt_Asset,
				price,
			} = await setup()

			const spEthBefore_Asset = await stabilityPoolERC20.getCollateral(erc20.address)
			const spVUSDBefore_Asset = await stabilityPoolERC20.getTotalDebtTokenDeposits()

			const txAsset = await vesselManagerOperations.batchLiquidateVessels(erc20.address, [alice, carol])

			// Confirm all vessels removed

			assert.isFalse(await sortedVessels.contains(erc20.address, alice))
			assert.isFalse(await sortedVessels.contains(erc20.address, carol))

			// Confirm vessels have status 'closed by liquidation' (Status enum element idx 3)

			assert.equal((await vesselManager.Vessels(alice, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
			assert.equal((await vesselManager.Vessels(carol, erc20.address))[th.VESSEL_STATUS_INDEX], "3")

			const spEthAfter_Asset = await stabilityPoolERC20.getCollateral(erc20.address)
			const spGRVTfter_Asset = await stabilityPoolERC20.getTotalDebtTokenDeposits()

			// liquidate collaterals with the gas compensation fee subtracted

			const expectedCollateralLiquidatedA_Asset = th.applyLiquidationFee(A_totalDebt_Asset.mul(mv._MCR).div(price))
			const expectedCollateralLiquidatedC_Asset = th.applyLiquidationFee(C_coll_Asset)
			// Stability Pool gains

			const expectedGainInVUSD_Asset = expectedCollateralLiquidatedA_Asset
				.mul(price)
				.div(mv._1e18BN)
				.sub(A_totalDebt_Asset)
			const realGainInVUSD_Asset = spEthAfter_Asset
				.sub(spEthBefore_Asset)
				.mul(price)
				.div(mv._1e18BN)
				.sub(spVUSDBefore_Asset.sub(spGRVTfter_Asset))

			assert.equal(
				spEthAfter_Asset.sub(spEthBefore_Asset).toString(),
				expectedCollateralLiquidatedA_Asset.toString(),
				"Stability Pool ETH doesn’t match"
			)
			assert.equal(
				spVUSDBefore_Asset.sub(spGRVTfter_Asset).toString(),
				A_totalDebt_Asset.toString(),
				"Stability Pool VUSD doesn’t match"
			)
			assert.equal(
				realGainInVUSD_Asset.toString(),
				expectedGainInVUSD_Asset.toString(),
				"Stability Pool gains don’t match"
			)
		})

		it("A vessel over TCR is not liquidated", async () => {
			const { collateral: A_coll_Asset, totalDebt: A_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(280, 16)),
				extraParams: { from: alice },
			})
			const { collateral: B_coll_Asset, totalDebt: B_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(276, 16)),
				extraParams: { from: bob },
			})
			const { collateral: C_coll_Asset, totalDebt: C_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(150, 16)),
				extraParams: { from: carol },
			})

			const totalLiquidatedDebt_Asset = A_totalDebt_Asset.add(B_totalDebt_Asset).add(C_totalDebt_Asset)

			await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(310, 16)),
				extraVUSDAmount: totalLiquidatedDebt_Asset,
				extraParams: { from: whale },
			})
			await stabilityPoolERC20.provideToSP(totalLiquidatedDebt_Asset, { from: whale })

			// Price drops
			await priceFeed.setPrice(erc20.address, dec(100, 18))
			const price = await priceFeed.getPrice(erc20.address)
			const TCR_Asset = await th.getTCR(contracts, erc20.address)

			// Check Recovery Mode is active
			assert.isTrue(await th.checkRecoveryMode(contracts, erc20.address))

			// Check vessels A, B are in range 110% < ICR < TCR, C is below 100%

			const ICR_A_Asset = await vesselManager.getCurrentICR(erc20.address, alice, price)
			const ICR_B_Asset = await vesselManager.getCurrentICR(erc20.address, bob, price)
			const ICR_C_Asset = await vesselManager.getCurrentICR(erc20.address, carol, price)

			assert.isTrue(ICR_A_Asset.gt(TCR_Asset))
			assert.isTrue(ICR_B_Asset.gt(mv._MCR) && ICR_B_Asset.lt(TCR_Asset))
			assert.isTrue(ICR_C_Asset.lt(mv._ICR100))

			const tx_Asset = await vesselManagerOperations.batchLiquidateVessels(erc20.address, [bob, alice])

			const liquidationEvents_Asset = th.getAllEventsByName(tx_Asset, "VesselLiquidated")
			assert.equal(liquidationEvents_Asset.length, 1, "Not enough liquidations")

			// Confirm only Bob’s vessel removed

			assert.isTrue(await sortedVessels.contains(erc20.address, alice))
			assert.isFalse(await sortedVessels.contains(erc20.address, bob))
			assert.isTrue(await sortedVessels.contains(erc20.address, carol))

			// Confirm vessels have status 'closed by liquidation' (Status enum element idx 3)

			assert.equal((await vesselManager.Vessels(bob, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
			assert.equal((await vesselManager.Vessels(alice, erc20.address))[th.VESSEL_STATUS_INDEX], "1")
			assert.equal((await vesselManager.Vessels(carol, erc20.address))[th.VESSEL_STATUS_INDEX], "1")
		})
	})

	context("Sequential liquidations", () => {
		const setup = async () => {
			const { collateral: A_coll_Asset, totalDebt: A_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(299, 16)),
				extraParams: { from: alice },
			})
			const { collateral: B_coll_Asset, totalDebt: B_totalDebt_Asset } = await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(298, 16)),
				extraParams: { from: bob },
			})

			const totalLiquidatedDebt_Asset = A_totalDebt_Asset.add(B_totalDebt_Asset)

			await openVessel({
				asset: erc20.address,
				ICR: toBN(dec(300, 16)),
				extraVUSDAmount: totalLiquidatedDebt_Asset,
				extraParams: { from: whale },
			})
			await stabilityPoolERC20.provideToSP(totalLiquidatedDebt_Asset, { from: whale })

			// Price drops
			await priceFeed.setPrice(erc20.address, dec(100, 18))
			const price = await priceFeed.getPrice(erc20.address)
			const TCR_Asset = await th.getTCR(contracts, erc20.address)

			// Check Recovery Mode is active
			assert.isTrue(await th.checkRecoveryMode(contracts, erc20.address))

			// Check vessels A, B are in range 110% < ICR < TCR, C is below 100%

			const ICR_A_Asset = await vesselManager.getCurrentICR(erc20.address, alice, price)
			const ICR_B_Asset = await vesselManager.getCurrentICR(erc20.address, bob, price)

			assert.isTrue(ICR_A_Asset.gt(mv._MCR) && ICR_A_Asset.lt(TCR_Asset))
			assert.isTrue(ICR_B_Asset.gt(mv._MCR) && ICR_B_Asset.lt(TCR_Asset))

			return {
				A_coll_Asset,
				A_totalDebt_Asset,
				B_coll_Asset,
				B_totalDebt_Asset,
				totalLiquidatedDebt_Asset,
				price,
			}
		}

		it("First vessel only doesn’t get out of Recovery Mode", async () => {
			await setup()

			await th.getTCR(contracts, erc20.address)
			assert.isTrue(await th.checkRecoveryMode(contracts, erc20.address))
		})

		it("Two vessels over MCR are liquidated", async () => {
			await setup()
			const tx_Asset = await vesselManagerOperations.liquidateVessels(erc20.address, 10)

			const liquidationEvents_Asset = th.getAllEventsByName(tx_Asset, "VesselLiquidated")
			assert.equal(liquidationEvents_Asset.length, 2, "Not enough liquidations")

			// Confirm all vessels removed

			assert.isFalse(await sortedVessels.contains(erc20.address, alice))
			assert.isFalse(await sortedVessels.contains(erc20.address, bob))

			// Confirm vessels have status 'closed by liquidation' (Status enum element idx 3)

			assert.equal((await vesselManager.Vessels(alice, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
			assert.equal((await vesselManager.Vessels(bob, erc20.address))[th.VESSEL_STATUS_INDEX], "3")
		})
	})
})

contract("Reset chain state", async accounts => {})
