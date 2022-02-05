interface SpCombat extends _Spirit {
	index: number;
}

interface SpMap {
	index: number;
	size: number;
	energy: number;
}

type SpsCombat = SpCombat[];
type SpsMap = SpMap[];

/**
 * Lowest energy first
 */
const sortSpiritsByEnergy = (spirits: SpsCombat | SpsMap): SpsMap =>
	spirits.slice().sort((a, b) => a.energy - b.energy);

/**
 * Biggest energy first
 */
const sortSpiritsByEnergyReverse = (spirits: SpsCombat | SpsMap): SpsMap =>
	spirits.slice().sort((a, b) => b.energy - a.energy);

/**
 * Spirit.size, but only as much energy as it has.
 */
const lossFromAttacking = (spirit: SpMap): number =>
	Math.min(spirit.size, spirit.energy);

/**
 * 2 * spirit.size, but only as much energy as it has.
 */
const attackdmg = (spirit: SpMap): number =>
	2 * Math.min(spirit.size, spirit.energy);

const evaluateTick = (
	friends: SpsCombat | SpsMap,
	enemies: SpsCombat | SpsMap,
): [SpsMap, SpsMap] => {
	const attcrs = sortSpiritsByEnergyReverse(friends);
	const dfndrs = sortSpiritsByEnergy(enemies);
	const attcrsEngy = attcrs.map(s => s.energy);
	const dfndrsEngy = dfndrs.map(s => s.energy);
	const attcrsCount = attcrs.length;
	const attcrsAlreadyAttacked = Array.from({length: attcrsCount});
	attcrsAlreadyAttacked.fill(false);

	for (const [i, defender] of dfndrs.entries()) {
		const defloss = lossFromAttacking(defender);
		for (const [j, attacker] of attcrs.entries()) {
			if (dfndrsEngy[i] - defloss >= 0 && !attcrsAlreadyAttacked[j]) {
				dfndrsEngy[i] -= attackdmg(attacker);
				attcrsEngy[j] -= lossFromAttacking(attacker);
				attcrsAlreadyAttacked[j] = true;
			}
		}
	}

	const attcrsEngyChnge = attcrs.map((s, i) => attcrsEngy[i] - s.energy);
	const dfndrsEngyChnge = dfndrs.map((s, i) => dfndrsEngy[i] - s.energy);

	const attcrs2 = sortSpiritsByEnergyReverse(enemies);
	const dfndrs2 = sortSpiritsByEnergy(friends);
	const attcrsEngy2 = attcrs2.map(s => s.energy);
	const dfndrsEngy2 = dfndrs2.map(s => s.energy);
	const attcrsCount2 = attcrs.length;
	const attcrsAlreadyAttacked2 = Array.from({length: attcrsCount2});
	attcrsAlreadyAttacked2.fill(false);

	for (const [i, defender] of dfndrs2.entries()) {
		const defloss = lossFromAttacking(defender);
		for (const [j, attacker] of attcrs2.entries()) {
			if (dfndrsEngy2[i] - defloss >= 0 && !attcrsAlreadyAttacked2[j]) {
				dfndrsEngy2[i] -= attackdmg(attacker);
				attcrsEngy2[j] -= lossFromAttacking(attacker);
				attcrsAlreadyAttacked2[j] = true;
			}
		}
	}

	const attcrsEngyChnge2 = attcrs2
		.map((s, i) => attcrsEngy2[i] - s.energy)
		.reverse();
	const dfndrsEngyChnge2 = dfndrs2
		.map((s, i) => dfndrsEngy2[i] - s.energy)
		.reverse();

	const attcrsAvgChnge = attcrsEngyChnge.map((x, i) => x + dfndrsEngyChnge2[i]);
	const dfndrsAvgChnge = dfndrsEngyChnge.map((x, i) => x + attcrsEngyChnge2[i]);
	const attcrsResultEngy = attcrs.map((s, i) => s.energy + attcrsAvgChnge[i]);
	const dfndrsResultEngy = dfndrs.map((s, i) => s.energy + dfndrsAvgChnge[i]);

	const attackersResult = attcrs
		.map((s, i) => ({
			index: s.index,
			size: s.size,
			energy: attcrsResultEngy[i],
		}))
		.filter(s => s.energy >= 0);

	const defendersResult = dfndrs
		.map((s, i) => ({
			index: s.index,
			size: s.size,
			energy: dfndrsResultEngy[i],
		}))
		.filter(s => s.energy >= 0);

	return [attackersResult, defendersResult];
};

/**
 * Return all ships that does NOT have a ship.index listed in the vector indexes.
 */
const spiritNotIn = (sp: SpsCombat, indexes: number[]): SpsCombat =>
	sp.filter(s => !indexes.includes(s.index));

const spiritValue = (sp: SpCombat | SpMap, sh: Base['shape']): number =>
	sh === 'squares' ? 260 : sh === 'circles' ? 15 * sp.size : 60;

/**
 * @returns {number} Advantage
 */
const evaluateBattle = (friends: SpsCombat, enemies: SpsCombat): number => {
	const friendsEnergy = friends.map(s => s.energy).reduce((a, b) => a + b, 0);
	const enemiesEnergy = enemies.map(s => s.energy).reduce((a, b) => a + b, 0);

	let [friendsCombat, enemiesCombat] = evaluateTick(friends, enemies);
	const friendsCombatEnergy = friendsCombat
		.map(s => s.energy)
		.reduce((a, b) => a + b, 0);
	const enemiesCombatEnergy = enemiesCombat
		.map(s => s.energy)
		.reduce((a, b) => a + b, 0);

	let someoneCanAttack = friendsCombatEnergy + enemiesCombatEnergy > 0;
	while (
		someoneCanAttack &&
		friendsCombat.length > 0 &&
		enemiesCombat.length > 0
	) {
		[friendsCombat, enemiesCombat] = evaluateTick(friendsCombat, enemiesCombat);
		someoneCanAttack = friendsCombatEnergy + enemiesCombatEnergy > 0;
	}

	const myEnergycost = friendsEnergy - friendsCombatEnergy;
	const enemyEnergycost = enemiesEnergy - enemiesCombatEnergy;

	const myAliveIndexes = friendsCombat.map(s => s.index);
	const myDeadShips = spiritNotIn(friends, myAliveIndexes);
	const myDeadShipsCost = myDeadShips
		.map(s => spiritValue(s, base.shape))
		.reduce((a, b) => a + b, 0);

	const enemyAliveIndexes = enemiesCombat.map(s => s.index);
	const enemyDeadShips = spiritNotIn(enemies, enemyAliveIndexes);
	const enemyDeadShipsCost = enemyDeadShips
		.map(s => spiritValue(s, enemy_base.shape))
		.reduce((a, b) => a + b, 0);

	const myValueLoss = myEnergycost + myDeadShipsCost;
	const enemyValueLoss = enemyEnergycost + enemyDeadShipsCost;
	const myAdvantage = enemyValueLoss - myValueLoss;
	return myAdvantage;
};

export default evaluateBattle;
