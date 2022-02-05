import data from '@/data';
import {getAvailableSpirits, getClose} from '@/utils/functions';
/**
 * Move closest not busy ship to p and make it busy.
 *
 * return 0 if no ship found. (1 otherwise)
 */
export const moveClosest = (
	trgtPos: Position[],
	pos: Position,
	busy: number[],
): 0 | 1 => {
	const {_spirits} = data;

	const availableFriends = getAvailableSpirits(_spirits.friends, busy);
	const closest = getClose.from(availableFriends, pos) || null;

	if (closest) {
		trgtPos[closest.index] = pos;
		busy.push(closest.index);
		return 1;
	}

	return 0;
};
