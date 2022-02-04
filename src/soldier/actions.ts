import {getClosest, canHarvestMiddle, positionsMatch} from '../utils/functions';
import {isInRange, isFull} from '../utils/state';
import {MY_STAR} from '../constants';
import common from '../common/actions';
import {getPatrolPoint, getPatrolLength} from './patrol';

/**
 * @function attack_base - Attack enemy base
 * @param spirit
 */
const attackBase = (spirit: Spirit) => {
	if (isFull(spirit)) {
		spirit.state = 'charging';
	} else if (spirit.energy === 0) {
		spirit.state = 'harvesting';
	}

	spirit.shout('⚔️');

	if (spirit.state === 'charging') {
		if (isInRange(spirit, enemy_base)) {
			spirit.energize(enemy_base);
		} else {
			spirit.move(enemy_base.position);
		}
	} else if (spirit.state === 'harvesting') {
		const target = getClosest.star(spirit);
		spirit.move(target.position);
		spirit.energize(spirit);
	}
};

/**
 * @function captureOutpost - Capture the outpost or energize it
 * @param {Spirit} spirit Current spirit
 */
const captureOutpost = (spirit: Spirit) => {
	if (isFull(spirit)) {
		spirit.state = 'charging';
	} else if (spirit.energy === 0) {
		spirit.state = 'harvesting';
	}

	const targetStar = canHarvestMiddle() ? star_p89 : getClosest.star(spirit);
	common.chargeOrHarvest(spirit, outpost, targetStar);
};

const merge = (spirit: CircleSpirit) => {
	if (base.shape !== 'circles') return;
	if (spirit.sight.friends.length === 0) return;

	const closest = getClosest.friends(spirit);
	const target: CircleSpirit = spirits[closest[0]] as CircleSpirit;

	if (isInRange(spirit, target)) {
		spirit.merge(target);
	}
};

/**
 * @function scout - Move in enemy's base sight to slow production
 * @param {Spirit} spirit Current spirit
 */
const scout = (spirit: Spirit) => {
	spirit.shout('🏕');

	const location: Position =
		MY_STAR === star_a1c
			? [enemy_base.position[0] + 340, enemy_base.position[1] - 200]
			: [enemy_base.position[0] - 300, enemy_base.position[1] + 250];

	if (positionsMatch(location, spirit.position) && base.shape === 'circles') {
		merge(spirit as CircleSpirit);
	} else {
		spirit.move(location);
	}
};

/**
 * @function stayDefense - Patrol around our base
 * @param {Spirit} spirit Current spirit
 */
const stayDefense = (spirit: Spirit) => {
	spirit.shout('🛡️');
	if (!memory.spirits[spirit.id]['patrol-position'])
		memory.spirits[spirit.id]['patrol-position'] = 0;
	if (!memory.patrolLength) memory.patrolLength = getPatrolLength();

	const patrolIndex: number = memory.spirits[spirit.id]['patrol-position'];
	const patrolLength: number = memory.patrolLength;
	const patrolPoint: Position = getPatrolPoint(patrolIndex % patrolLength);
	spirit.move(patrolPoint);
	if (positionsMatch(patrolPoint, spirit.position)) {
		memory.spirits[spirit.id]['patrol-position']++;
	}
};

/**
 * @function recharge - Move to closest ally star
 * @param {Spirit} spirit Current spirit
 */
const recharge = (spirit: Spirit) => {
	const target = getClosest.star(spirit);
	if (isInRange(spirit, target)) {
		spirit.shout('🔋');
		spirit.energize(spirit);
	} else {
		spirit.move(target.position);
	}
};

const soldierActions = {
	attackBase,
	captureOutpost,
	merge,
	scout,
	stayDefense,
	recharge,
};
export default soldierActions;
