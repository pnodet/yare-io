import {MY_STAR} from '../constants';
import workerActions from './actions';
import {getRole, shouldHarvestMiddle, shouldWorkerHeal} from './decisions';

/**
 * Strategy:
 */

const workerStrategy = (spirit: Spirit, index: number) => {
	if (!spirit.role) spirit.role = getRole();

	/* 
	If (spirit.role === 'harvester') {
		workerActions.harvest(spirit);
		return;
	}

	if (spirit.role === 'linker') {
		workerActions.link(spirit);
		return;
	}

	if (spirit.role === 'feeder') {
		workerActions.feed(spirit);
		return;
	}

 */
	if (!spirit.targetStar && shouldHarvestMiddle()) {
		spirit.targetStar = [MY_STAR, star_p89][index % 2];
	} else if (!spirit.targetStar) {
		spirit.targetStar = MY_STAR;
	}

	if (shouldWorkerHeal(spirit)) workerActions.heal(spirit);
	if (spirit.targetStar === star_p89) {
		workerActions.harvestMiddle(spirit);
		return;
	}

	if (spirit.targetStar === MY_STAR) {
		workerActions.harvestClosest(spirit);
	}
};

export default workerStrategy;
