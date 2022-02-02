import {getClosest, getLowest} from '../utils/functions';
import {isInRange} from '../utils/state';

const chargeOrHarvest = (
	sp: Spirit,
	a: Spirit | Structure,
	b: Spirit | Structure,
) => {
	if (sp.state === 'charging') {
		if (isInRange(sp, a)) {
			sp.shout('⚗️');
			sp.energize(a);
		} else {
			sp.move(a.position);
		}
	} else if (sp.state === 'harvesting') {
		if (isInRange(sp, b)) {
			sp.shout('🌾');
			sp.energize(sp);
		} else {
			sp.move(b.position);
		}
	}
};

/**
 * @function retreat Execute action retreat
 * @param {Spirit} spirit Current spirit
 */
const retreat = (spirit: Spirit) => {
	spirit.shout('😱');
	if (!isInRange(spirit, base)) {
		spirit.move(base.position);
	}
};

/**
 * @function defendBase Execute action defend base
 * @param {Spirit} spirit Current spirit
 */
const defendBase = (spirit: Spirit) => {
	const closest = getClosest.enemies(base);
	const lowest = getLowest.enemies(base);

	const target = isInRange(spirit, spirits[lowest[0]])
		? spirits[lowest[0]]
		: spirits[closest[0]];

	if (isInRange(spirit, target)) {
		spirit.energize(target);
		spirit.energize(target);
	} else {
		spirit.move(target.position);
	}
};

/**
 * @function selfDefense - Attack enemies in range
 * @param {Spirit} spirit Current spirit
 */
const selfDefense = (spirit: Spirit) => {
	spirit.shout('⚔️');

	const closest = getClosest.enemies(spirit);
	const lowest = getLowest.enemies(spirit);
	const target = isInRange(spirit, spirits[lowest[0]])
		? spirits[lowest[0]]
		: spirits[closest[0]];

	if (isInRange(spirit, target)) {
		spirit.energize(target);
		spirit.energize(target);
	} else {
		spirit.move(target.position);
	}
};

const commonActions = {chargeOrHarvest, retreat, defendBase, selfDefense};
export default commonActions;
