import data from '@/data';
import {dist} from '@/utils/vectors';

export const getMovingAverage = (values: number[], window = 60) => {
	let average = 0;
	let periods = 0;
	for (let index = values.length - window; index < values.length; index++) {
		if (index < 0) continue;
		const element = values[index];
		average += element;
		periods++;
	}

	return average / periods;
};

const getClosestFrom = (sp: Spirit[], pos: Position): Spirit => {
	const distances = sp.slice().map(s => dist(pos, s.position));
	const closest = sp[distances.indexOf(Math.min(...distances))];
	return closest;
};

const getCloseStar = (pos: Position): Star => {
	let starsArray = [star_zxq, star_a1c, star_p89];
	starsArray = starsArray.filter(star => tick > star.active_at);
	const distances = starsArray.map(star => dist(pos, star.position));
	const closest = starsArray[distances.indexOf(Math.min(...distances))];
	return closest;
};

const getCloseFriends = (pos: Position): SpiritID[] => {
	const friends = data._spirits.friends
		.slice()
		.map(friend => ({id: friend.id, dist: dist(pos, friend.position)}))
		.sort((a, b) => a.dist - b.dist)
		.map(friends => friends.id);
	return friends;
};

const getCloseEnemies = (pos: Position): SpiritID[] => {
	const enemies = data._spirits.enemies
		.slice()
		.map(enemy => ({
			id: enemy.id,
			dist: dist(pos, enemy.position),
		}))
		.sort((a, b) => a.dist - b.dist)
		.map(enemy => enemy.id);
	return enemies;
};

export const getClose = {
	star: getCloseStar,
	friends: getCloseFriends,
	enemies: getCloseEnemies,
	from: getClosestFrom,
};

/**
 * Smallest distance first
 */
export const sortByNearestEnemyDistance = (spirits_: Spirit[]): Spirit[] =>
	spirits_
		.slice()
		.sort(
			(a, b) =>
				dist(a.position, spirits[getCloseEnemies(a.position)[0]].position) -
				dist(b.position, spirits[getCloseEnemies(b.position)[0]].position),
		);

const getLowestFriends = (sp: Spirit | Base): SpiritID[] => {
	const friends = sp.sight.friends
		.slice()
		.filter(friendId => spirits[friendId].hp > 0)
		.map(friendId => ({id: friendId, energy: spirits[friendId].energy}))
		.sort((a, b) => a.energy - b.energy)
		.map(friends => friends.id);
	return friends;
};

const getLowestEnemies = (sp: Spirit | Base): SpiritID[] => {
	const enemies = sp.sight.enemies
		.slice()
		.map(enemyId => ({id: enemyId, hp: spirits[enemyId].hp}))
		.sort((a, b) => a.hp - b.hp)
		.map(enemy => enemy.id);
	return enemies;
};

export const getLowest = {
	friends: getLowestFriends,
	enemies: getLowestEnemies,
};

export const getAvailableSpirits = (
	sp: Spirit[],
	indexes: number[],
): Spirit[] => sp.filter(s => !indexes.includes(s.index));

const starEnergyGain = (starEnergy: number): number =>
	Math.round(2 + 0.02 * starEnergy);

/**
 * The maximum number of farmers (taking energy half the time) possible at star max energy without star losing energy.
 */
export const getMaxFarmers = (star: Star, spiritSize: Spirit['size']): number =>
	Math.floor(starEnergyGain(star.energy_capacity) / (0.5 * spiritSize));

/**
 * The maximum number of farmers (taking energy half the time) to still have star grow by atleast 1 each tick.
 */
export const getSustainableFarmers = (
	star: Star,
	spiritSize: Spirit['size'],
): number =>
	star.energy === 1000
		? Math.floor(starEnergyGain(star.energy) / (0.5 * spiritSize))
		: Math.floor((starEnergyGain(star.energy) - 1) / (0.5 * spiritSize));

/**
 * ```raw
 * The minimum required energy a star needs to sustain itself at n farmers (farming half the time)
 *
 * sustain means:
 * 1. star.energy<1000: grow by atleast 1
 * 2. star.energy=1000: not decrease
 * ```
 */
export const sustainableStarEnergy = (
	star: Star,
	n: number,
	shipsize: number,
): number =>
	star.energy === 1000
		? (n * 0.5 * shipsize - 2) / 0.02
		: (n * 0.5 * shipsize - 1) / 0.02;

/**
 * Lowest energy first
 */
export const sortByShipenergy = (sp: Spirit[]): Spirit[] =>
	sp.slice().sort((a, b) => a.energy - b.energy);

/**
 * Biggest energy first
 */
export const sortByShipenergyReverse = (sp: Spirit[]): Spirit[] =>
	sp.slice().sort((a, b) => b.energy - a.energy);

export const getSpiritsInRange = (
	pos: Position,
	sp: Spirit[],
	range = 200,
): Spirit[] => sp.filter(s => dist(pos, s.position) <= range);

/**
 * ```raw
 * How much damage a ship does to another ship.
 *
 * 2 * Math.min(ship.size, ship.energy)
 * ```
 */
export const attackdmg = (sp: Spirit): number =>
	2 * Math.min(sp.size, sp.energy);

/**
 * ```raw
 * How much energy a ship loses (by energizing)
 *
 * Math.min(ship.size, ship.energy);
 * ```
 */
export const lossFromAttacking = (sp: Spirit): number =>
	Math.min(sp.size, sp.energy);

/**
 * ```raw
 * How much energy a ship transfers (by energizing)
 *
 * note: actually same as lossFromAttacking() but use this for clarity when appropriate.
 *
 * Math.min(ship.size, ship.energy);
 * ```
 */
export const transferamount = (sp: Spirit): number =>
	Math.min(sp.size, sp.energy);

/**
 * Return the ship with index i (if it exists)
 */
export const getSpiritFromIndex = (spirit_: Spirit[], i: number): Spirit => {
	for (const sp of spirit_) {
		if (sp.index === i) {
			return sp;
		}
	}

	console.log('getSpiritFromIndex: Not found, returning first ship');
	return spirit_[0];
};

/**
 * Return 0 If I dont have outpost, else return the outpost energy
 */
export const myOutpostEnergy = (): number => {
	const {_outpostStatus} = data;
	return _outpostStatus.me ? outpost.energy : 0;
};

export const getShipCost = (base: Base): number => {
	let cost = base.current_spirit_cost;
	switch (base.shape) {
		case 'squares': {
			cost -= 100;
			break;
		}

		case 'circles': {
			cost -= 10;
			break;
		}

		case 'triangles': {
			cost -= 30;
			break;
		}
		// No default
	}

	return cost;
};
