import RenderService from '../node_modules/yare-code-sync/client/RenderService';
import {
	chooseSpiritType,
	shouldSelfDefend,
	shouldDefendBase,
	shouldRetreat,
} from './common/decisions';
import soldierStrategy from './soldier/strategies';
import workerStrategy from './worker/strategies';
import commonActions from './common/actions';

RenderService.circle(base.position, 200, '#ff0000');
RenderService.circle(base.position, 400, '#ff0000');
RenderService.circle(enemy_base.position, 400, '#ff0000');

/**
 * Iterate over each spirit and decide what to do
 */
for (const [index, spirit] of my_spirits.entries()) {
	if (!memory.spirits[spirit.id]) memory.spirits[spirit.id] = {};
	if (!spirit.type) spirit.type = chooseSpiritType();

	if (shouldRetreat(spirit)) {
		commonActions.retreat(spirit);
		continue;
	}

	if (shouldSelfDefend(spirit)) {
		commonActions.selfDefense(spirit);
		continue;
	}

	if (shouldDefendBase(spirit, index)) {
		commonActions.defendBase(spirit);
		continue;
	}

	if (spirit.type === 'worker') {
		workerStrategy(spirit, index);
		continue;
	}

	if (spirit.type === 'soldier') {
		soldierStrategy(spirit);
		continue;
	}
}
