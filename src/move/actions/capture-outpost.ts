import data from '@/data';
import {getAvailableSpirits, myOutpostEnergy} from '@/utils/functions';
import {moveClosest} from '@/move/helpers';
import {_stage} from '@/utils/state';
import _points from '@/data-points';

export default function captureOutpost(
	trgtPos: Position[],
	busy: number[],
): void {
	const {_spirits, _info} = data;
	const {friends} = _spirits;

	const availableFriends = getAvailableSpirits(friends, busy);
	if (_stage === 0 && availableFriends.length > 4) {
		const fpm = _points.star2middlefarm.mid;
		if (tick > 66 && !_info.outpostcontrolIsEnemy) {
			moveClosest(trgtPos, fpm.star, busy);
		}

		if (tick > 100 && !_info.outpostcontrolIsEnemy) {
			moveClosest(trgtPos, fpm.star, busy);
		}
	}

	if (_stage === 1 && myOutpostEnergy() < 200) {
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
		moveClosest(trgtPos, _points.star2middlefarm.mid.starforward, busy);
	}
}
