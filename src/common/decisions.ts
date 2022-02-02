import {
	getClosest,
	getDistance,
	getSpiritsEnergyInRange,
} from '../utils/functions';
import {count, target, movingAverage, movingAverageOp} from '../data';
import {isInRange} from '../utils/state';

enum Type {
	worker = 'worker',
	soldier = 'soldier',
}

/**
 * Decide new spirit type
 * @returns {Type} Either soldier or worker
 */
export const chooseSpiritType = (): Type => {
	if (
		count.total - count.harvester < target.solider ||
		movingAverage > movingAverageOp + 1.5
	) {
		return Type.soldier;
	}

	return Type.worker;
};

/**
 * Should the spirit self defend?
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldSelfDefend = (spirit: Spirit): boolean => {
	const enemiesAround = getClosest.enemies(spirit);
	const friendsAround = getClosest.friends(spirit);
	if (enemiesAround.length === 0) return false;
	if (getDistance(spirit, spirits[enemiesAround[0]]) > 250) return false;
	return true;
};

/**
 * Should the spirit defend the base?
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldDefendBase = (spirit: Spirit, index: number): boolean => {
	return (
		base.sight.enemies.length > 0 &&
		spirit.energy > 0 &&
		spirit.role !== 'scout'
	);
};

/**
 * Should the spirit run away?
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldRetreat = (sp: Spirit): boolean => {
	if (sp.sight.enemies.length === 0) return false;
	const closestEnemy = getClosest.enemies(sp);
	if (sp.energy < 3 && getDistance(sp, spirits[closestEnemy[0]]) < 350)
		return true;
	const enemiesEnergy = getSpiritsEnergyInRange(sp, sp.sight.enemies);
	const friendsInRange = sp.sight.friends.filter(friendId =>
		isInRange(sp, spirits[friendId]),
	);
	if (!friendsInRange || friendsInRange.length === 0)
		return enemiesEnergy * 1.25 > sp.energy;
	const friendsWithEnergy = friendsInRange.filter(
		friendId => spirits[friendId].energy > 3,
	);
	const friendsEnergy = getSpiritsEnergyInRange(sp, friendsWithEnergy);
	return enemiesEnergy * 1.25 > friendsEnergy;
};
