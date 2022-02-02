/* eslint-disable @typescript-eslint/naming-convention */
import {getDistance} from './utils/functions';

export const SIGHT_RANGE = 400;
export const BEAM_RANGE = 200;
export const MOVE_DISTANCE = 20;
export const JUMP_DISTANCE = 200;
export const JUMP_COST = 50;

/**
 * @name MY_STAR
 * @returns {LargeStar} Closest large star
 */
export const MY_STAR =
	getDistance(base, star_a1c) > getDistance(base, star_zxq)
		? star_zxq
		: star_a1c;
