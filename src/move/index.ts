import ACTIONS from '@/mv-actions/index';

export default function getMoveOrders(): [Position[], number, number] {
	const targetPositions: Position[] = Array.from({
		length: my_spirits.length,
	}).fill(null) as Position[];
	const busy: number[] = [];

	let nfarmers = 0;
	let nmidfarmers = 0;

	ACTIONS.defendBase(targetPositions, busy);
	ACTIONS.captureOutpost(targetPositions, busy);
	[nfarmers, nmidfarmers] = ACTIONS.farm(targetPositions, busy);
	ACTIONS.scout(targetPositions, busy);

	/**
	 * TODO:
	 shouldAttack(targetPositions);
	 shouldSelfDefend(targetPositions);
	 */

	return [targetPositions, nfarmers, nmidfarmers];
}
