import {getMovingAverage} from './utils/functions';
import data from './data';

const {_players} = data;

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
		.reduce((a, b) => a + b);

const totalEnergyOp: number =
	enemy_base.energy +
	Object.values(spirits)
		.filter(s => (s.id as SpiritID).startsWith(_players.enemy))
		.filter(s => s.hp > 0)
		.map(s => s.energy as number)
		.reduce((a, b) => a + b);

const niceRound = (number_: number): number =>
	Math.round((number_ + Number.EPSILON) * 100) / 100;

const _export = {
	totalEnergy,
	movingAverage: niceRound(movingAverage),
	totalEnergyOp,
	movingAverageOp: niceRound(movingAverageOp),
};
export default _export;
