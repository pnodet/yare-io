import {BEAM_RANGE} from '../constants';
import {getDistance, getPlayerId} from './functions';

const isFull = (element: Outpost | Spirit): boolean =>
	element.energy === element.energy_capacity;

const almostFull = (element: Outpost | Spirit): boolean =>
	element.energy >= element.energy_capacity * 0.8;

const notFull = (element: Outpost | Spirit): boolean =>
	element.energy < element.energy_capacity;

const isEmpty = (element: Outpost | Spirit): boolean => element.energy === 0;

const almostEmpty = (element: Outpost | Spirit): boolean =>
	element.energy <= element.energy_capacity * 0.2;

const notEmpty = (element: Outpost | Spirit): boolean => element.energy > 0;

const isInRange = (sp: Spirit, st: Structure | Spirit): boolean =>
	getDistance(sp, st) < BEAM_RANGE;

const getSpiritsFriends = () => {
	const allSpirits = Array.from(Object.values(spirits)) as Spirit[];
	const friends = allSpirits.filter(
		sp => sp.id.startsWith(getPlayerId.me) && sp.hp > 0,
	);
	return friends;
};

const getSpiritsEnemies = () => {
	const allSpirits = Array.from(Object.values(spirits)) as Spirit[];
	const enemies = allSpirits.filter(
		sp => sp.id.startsWith(getPlayerId.enemy) && sp.hp > 0,
	);
	return enemies;
};

const getSpirits = {
	friends: getSpiritsFriends,
	enemies: getSpiritsEnemies,
};

export {
	isFull,
	almostFull,
	notFull,
	isEmpty,
	almostEmpty,
	notEmpty,
	isInRange,
	getSpirits,
};
