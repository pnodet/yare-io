import {count, target} from '../data';
import soldierActions from './actions';
import {
	shouldScout,
	shouldAttackBase,
	shouldRecharge,
	shouldCaptureOutpost,
} from './decisions';

/**
 * Strategy:
 * - if there are enemies, attack
 * - if there are no enemies, soldier go to the middle star
 * - if there are no enemies, worker go to the closest star
 *
 * soldier capture the outpost
 * when the outpost is captured, soldier attack the enemy base
 *
 * if our base is attacked, soldier defend
 * if our base is attacked, worker defend
 *
 * number of soldiers is equal to the number of workers ?
 * average econ is better than enemy ?
 */

export default function soldierStrategy(spirit: Spirit) {
	if (!spirit.role) {
		if (count.scout < target.scout) {
			spirit.role = 'scout';
		} else if (count.defender < target.defender) {
			spirit.role = 'defender';
		} else {
			spirit.role = 'attacker';
		}
	}

	if (shouldAttackBase()) {
		soldierActions.attackBase(spirit);
		return;
	}

	if (shouldScout(spirit)) {
		soldierActions.scout(spirit);
		return;
	}

	if (shouldCaptureOutpost()) {
		soldierActions.captureOutpost(spirit);
		return;
	}

	if (shouldRecharge(spirit)) {
		soldierActions.recharge(spirit);
		return;
	}

	if (spirit.role === 'defender') {
		soldierActions.stayDefense(spirit);
		return;
	}

	soldierActions.stayDefense(spirit);
}
