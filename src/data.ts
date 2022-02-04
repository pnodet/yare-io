import {getMovingAverage, getPlayerId} from './utils/functions';

if (!memory.spirits) memory.spirits = {};

/**
 *  Get the average economy
 */
if (!memory.movingAverage) memory.movingAverage = [];
let economyScore = base.energy - (memory.prevEnergy || 0);
economyScore = economyScore < 0 ? 0 : economyScore;
memory.movingAverage.push(economyScore);
const movingAverage = getMovingAverage(memory.movingAverage);
memory.prevEnergy = base.energy;

/**
 *  Get the average enemy economy
 */
if (!memory.movingAverageOp) memory.movingAverageOp = [];
let economyScoreOp = enemy_base.energy - (memory.prevEnergyOp || 0);
economyScoreOp = economyScoreOp < 0 ? 0 : economyScoreOp;
memory.movingAverageOp.push(economyScoreOp);
const movingAverageOp = getMovingAverage(memory.movingAverageOp);
memory.prevEnergyOp = enemy_base.energy;

const totalEnergy: number =
	base.energy +
	Object.values(my_spirits)
		.filter(s => s.hp > 0)
		.map(s => s.energy as number)
		.reduce((a, b) => a + b, 0);

const totalEnergyOp: number =
	enemy_base.energy +
	Object.values(spirits)
		.filter(s => (s.id as SpiritID).startsWith(getPlayerId.enemy))
		.filter(s => s.hp > 0)
		.map(s => s.energy as number)
		.reduce((a, b) => a + b, 0);

const count: Record<string, number> = {
	total: 0,
	attacker: 0,
	defender: 0,
	scout: 0,
	harvester: 0,
	linker: 0,
	feeder: 0,
};

for (const role of Object.keys(count)) count[role] = 0;

for (const spirit of my_spirits) {
	if (spirit.hp === 0) continue;
	const currentRole = spirit.role;
	if (!currentRole) continue;
	count[currentRole]++;
}

for (const role of Object.keys(count)) count.total += count[role];
const targetScout = Math.max(1, Math.round(count.total * 0.05));
const targetDefender = Math.round(count.total * 0.1);
const targetSolider = Math.min(tick * 0.2, count.total * 0.1);

const target = {
	scout: targetScout,
	defender: targetDefender,
	solider: targetSolider,
};

export {count, totalEnergy, target, movingAverage, movingAverageOp};

const niceRound = (number_: number): number =>
	Math.round((number_ + Number.EPSILON) * 100) / 100;

console.log(`ticks: ${tick}`);
console.log(`totalEnergy:  ${totalEnergy}`);
console.log(`movingAverage:  ${niceRound(movingAverage)}`);
console.log(`totalEnergyOp:  ${totalEnergyOp}`);
console.log(`movingAverageOp:  ${niceRound(movingAverageOp)}`);
