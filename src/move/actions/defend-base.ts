import data from '@/data';
import {getClose, getAvailableSpirits} from '@/utils/functions';
import {offset, dist, isWithinDist} from '@/utils/vectors';
import evaluateBattle from '@/battle-eval';

export default function defendBase(trgtPos: Position[], busy: number[]): void {
	const {_spirits} = data;
	const {friends, enemies} = _spirits;
	const attackers = enemies.filter(s =>
		isWithinDist(s.position, base.position, 320),
	);

	if (attackers) {
		for (const enemy of attackers) {
			const distance = dist(enemy.position, base.position);
			const interceptPoint = offset(
				base.position,
				enemy.position,
				Math.max(distance - 199, base.collision_radius + 1),
			);

			let battleEval = 0;
			const needToBeSent: Spirit[] = [];

			while (battleEval <= 0) {
				const availableFriends = getAvailableSpirits(friends, busy);
				const closest = getClose.from(availableFriends, interceptPoint) || null;

				if (closest && availableFriends.length > 4) {
					trgtPos[closest.index] = interceptPoint;
					busy.push(closest.index);
					needToBeSent.push(closest);
					battleEval = evaluateBattle(needToBeSent, [enemy]);
				} else {
					break;
				}
			}
		}
	}
}
