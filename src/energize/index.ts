import ACTIONS from '@/engy-actions/index';
import data from '@/data';

export default function getEnergizeOrders(
	nfarmers: number,
	nmidfarmers: number,
): Entity[] {
	const {_spirits} = data;
	const {friends, enemies} = _spirits;

	const targets: Entity[] = Array.from({
		length: my_spirits.length,
	}).fill(null) as Entity[];

	const busy: number[] = [];
	const attacking: number[] = [];

	ACTIONS.enemy(targets, attacking);
	ACTIONS.self(targets, busy, attacking, nfarmers, nmidfarmers);
	ACTIONS.outpost(targets, busy, attacking);
	ACTIONS.friend(targets, busy, attacking, nfarmers);
	ACTIONS.base(targets, busy, attacking, nfarmers);

	return targets;
}
