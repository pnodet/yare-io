import evaluateBattle from '@/battle-eval';
import data from '@/data';
import {getAvailableSpirits, getClose} from '@/utils/functions';
import {_stage} from '@/utils/state';
import {dist, isWithinDist, offset} from '@/utils/vectors';

const {_spirits} = data;
const {friends, enemies} = _spirits;

export default function defendStructure(
	lists: {
		moveOrders: Position[];
		energizeOrders: Entity[];
		busySpirits: number[];
	},
	attackers: Spirit[],
	struct: Structure,
): void {
	for (const enemy of attackers) {
		const distance = dist(enemy.position, struct.position);
		const interceptPoint = offset(
			struct.position,
			enemy.position,
			Math.max(distance - 199, struct.collision_radius + 1),
		);

		let battleEval = 0;
		const needToBeSent: Spirit[] = [];

		while (battleEval <= 0) {
			const availableFriends = getAvailableSpirits(friends, lists.busySpirits);
			const closest = getClose.from(availableFriends, interceptPoint) || null;

			if (closest && availableFriends.length > 4) {
				lists.moveOrders[closest.index] = interceptPoint;
				lists.busySpirits.push(closest.index);
				needToBeSent.push(closest);
				battleEval = evaluateBattle(needToBeSent, [enemy]);
			} else {
				break;
			}
		}
	}
}
