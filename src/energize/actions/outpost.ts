import data from '@/data';
import {getAvailableSpirits, myOutpostEnergy} from '@/utils/functions';
import {notEmpty} from '@/utils/state';
import {isWithinDist} from '@/utils/vectors';

export default function energizeOutpost(
	targets: Entity[],
	busy: number[],
	attacking: number[],
): void {
	const {_spirits, _info} = data;
	const {friends} = _spirits;

	const shouldEnergizeOutpost =
		outpost.energy === 0 || (tick > 61 && myOutpostEnergy() <= 600);

	if (shouldEnergizeOutpost) {
		const ships = getAvailableSpirits(friends, busy.concat(attacking)).filter(
			s => isWithinDist(s.position, outpost.position) && notEmpty(s),
		);
		for (const ship of ships) {
			targets[ship.index] = outpost;
			if (!_info.outpostcontrolIsMe) {
				attacking.push(ship.index);
			}
		}
	}
}
