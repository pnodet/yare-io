import {
	getClosest,
	canHarvestMiddle,
	getChainPosition,
	getChainTarget,
	positionsMatch,
} from '../utils/functions';
import {
	almostEmpty,
	almostFull,
	isEmpty,
	isFull,
	isInRange,
	notEmpty,
	notFull,
} from '../utils/state';
import {MY_STAR} from '../constants';
import common from '../common/actions';

/**
 * @function harvestClosest - Move back and forth to harvest closest star
 * @param {Spirit} spirit Current spirit
 */
const harvestClosest = (spirit: Spirit) => {
	let target = getClosest.star(spirit);
	if (target === star_p89 && !canHarvestMiddle()) {
		target = MY_STAR;
	}

	if (almostFull(spirit)) {
		spirit.state = 'charging';
	} else if (almostEmpty(spirit)) {
		spirit.state = 'harvesting';
	}

	common.chargeOrHarvest(spirit, base, target);
};

/**
 * @function harvestMiddle - Move back and forth to harvest middle star
 * @param {Spirit} spirit Current spirit
 */
const harvestMiddle = (spirit: Spirit) => {
	if (almostFull(spirit)) {
		spirit.state = 'charging';
	} else if (almostEmpty(spirit)) {
		spirit.state = 'harvesting';
	}

	common.chargeOrHarvest(spirit, base, star_p89);
};

/**
 * @function heal - Energize a close soldier
 * @param {Spirit} spirit Current spirit
 */
const heal = (spirit: Spirit) => {
	const target = getClosest
		.friends(spirit)
		.filter(s => spirits[s].type === 'soldier');
	if (target.length === 0) return;
	const friendToHeal = spirits[target[0]];
	if (friendToHeal.energy === friendToHeal.energy_capacity) return;
	spirit.energize(friendToHeal);
};

/**
 * @function harvest - Move close to a star and send energy to linker
 * @param {Spirit} spirit Current spirit
 */
const harvest = (spirit: Spirit) => {
	const targetPos = getChainPosition(base, MY_STAR, -520);
	const targetChain = getChainTarget(spirit, 'linker');
	const targetStar = MY_STAR;

	if (almostFull(spirit)) {
		spirit.state = 'charging';
	} else if (almostEmpty(spirit)) {
		spirit.state = 'harvesting';
	}

	if (
		spirit.state === 'charging' &&
		positionsMatch(targetPos, spirit.position) &&
		targetChain
	) {
		spirit.energize(spirits[targetChain]);
	} else if (spirit.state === 'harvesting' && isInRange(spirit, targetStar)) {
		spirit.energize(spirit);
	} else {
		spirit.move(targetPos);
	}
};

/**
 * @function link - Move inbetween a star and the base to create a chain
 * @param {Spirit} spirit Current spirit
 */
const link = (spirit: Spirit) => {
	const targetPos = getChainPosition(base, MY_STAR, -340);
	const targetChain = getChainTarget(spirit, 'feeder');
	if (positionsMatch(targetPos, spirit.position) && targetChain) {
		spirit.energize(spirits[targetChain]);
	} else {
		spirit.move(targetPos);
	}
};

/**
 * @function feed - Stand close to the base and energize it
 * @param {Spirit} spirit Current spirit
 */
const feed = (spirit: Spirit) => {
	const targetPos = getChainPosition(base, MY_STAR, -195);
	if (positionsMatch(targetPos, spirit.position)) {
		spirit.energize(base);
	} else {
		spirit.move(targetPos);
	}
};

const workerActions = {
	harvestClosest,
	harvestMiddle,
	heal,
	harvest,
	link,
	feed,
};
export default workerActions;
