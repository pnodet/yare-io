import evaluateBattle from '@/battle-eval';
import data from '@/data';
import {getAvailableSpirits, getClose} from '@/utils/functions';
import {_stage} from '@/utils/state';
import {dist, isWithinDist, offset} from '@/utils/vectors';

const {_spirits} = data;
const {friends, enemies} = _spirits;

export default function defendStructure(
	trgtPos: Position[],
	busy: number[],
	struct: Structure,
	range = 300,
): void {
	const attackers = enemies.filter(s =>
		isWithinDist(s.position, struct.position, range),
	);

	if (attackers) {
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
