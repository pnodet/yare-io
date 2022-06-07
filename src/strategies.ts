import data from './data';
import {isWithinDist} from '@/utils/vectors';

const {_spirits} = data;
const {friends, enemies} = _spirits;

export const stratDefendBase = (): {should: boolean; attackers?: Spirit[]} => {
	const attackers = enemies.filter(sp =>
		isWithinDist(sp.position, base.position, 320),
	);

	if (attackers.length > 0) return {should: true, attackers};
	return {should: false};
};

export const stratDefendOutpost = (): {
	should: boolean;
	attackers?: Spirit[];
} => {
	const attackers = enemies.filter(sp =>
		isWithinDist(sp.position, outpost.position, 250),
	);
	if (attackers.length > 0) return {should: true, attackers};
	return {should: false};
};
