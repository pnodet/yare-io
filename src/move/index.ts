import ACTIONS from '@/mv-actions/index';
import data from '@/data';
import {myOutpostEnergy} from '@/utils/functions';

export default function getMoveOrders(): [Position[], number, number] {
	const {_spirits, _stars} = data;
	const {friends} = _spirits;
	const targetPositions: Position[] = Array.from({
		length: friends.length,
	}).fill(null) as Position[];
	const busy: number[] = [];

	let nfarmers = 0;
	let nmidfarmers = 0;

	ACTIONS.defendStructure(targetPositions, busy, base, 320);

	if (myOutpostEnergy() > 200 && _stars.middle.energy > 50) {
		ACTIONS.defendStructure(targetPositions, busy, _stars.middle, 240);
	}

	ACTIONS.captureOutpost(targetPositions, busy);
	[nfarmers, nmidfarmers] = ACTIONS.farm(targetPositions, busy);
	// ACTIONS.scout(targetPositions, busy);
	ACTIONS.remaining(targetPositions, busy, nmidfarmers);
	ACTIONS.combat(targetPositions);
	return [targetPositions, nfarmers, nmidfarmers];
}
