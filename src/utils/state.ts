import {getMaxFarmers} from './functions';
import {dist, isWithinDist} from '@/utils/vectors';
import data from '@/data';

export const range = 200;

export const isFull = (element: Outpost | Spirit): boolean =>
	element.energy === element.energy_capacity;

export const almostFull = (element: Outpost | Spirit): boolean =>
	element.energy >= element.energy_capacity * 0.8;

export const notFull = (element: Outpost | Spirit): boolean =>
	element.energy < element.energy_capacity;

export const isEmpty = (element: Outpost | Spirit): boolean =>
	element.energy === 0;

export const almostEmpty = (element: Outpost | Spirit): boolean =>
	element.energy <= element.energy_capacity * 0.2;

export const notEmpty = (element: Outpost | Spirit): boolean =>
	element.energy > 0;

export const hasRoom = (sp: Spirit, n = 1): boolean =>
	sp.energy <= sp.energy_capacity - sp.size * n;

export const isInRange = (sp: Spirit, st: Structure | Spirit): boolean =>
	dist(sp.position, st.position) < range;

export const canTransfer = (sp: Spirit, n = 1): boolean =>
	sp.energy >= sp.size * n;

/**
 * The number of times a ship wants to be healed
 */
export const requestedHeals = (sp: Spirit): number =>
	Math.floor((sp.energy_capacity - sp.energy) / sp.size);

const getStage = (): 0 | 1 => {
	const {_spirits, _stars} = data;
	const Nhome_max = getMaxFarmers(_stars.me, _spirits.friends[0].size);
	if (_spirits.friends.length > Nhome_max * 2 + 4) {
		return 1;
	}

	return 0;
};

export const _stage = getStage();

export const isNearStar = (s: Spirit): boolean => {
	const {_stars} = data;
	return (
		isWithinDist(s.position, _stars.me.position) ||
		isWithinDist(s.position, _stars.middle.position) ||
		isWithinDist(s.position, _stars.enemy.position)
	);
};

export const notNearStar = (s: Spirit): boolean => !isNearStar(s);
