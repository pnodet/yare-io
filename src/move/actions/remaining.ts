import data from '@/data';
import {getAvailableSpirits} from '@/utils/functions';
import {moveClosest} from '@/move/helpers';
import {_stage} from '@/utils/state';
import _points from '@/data-points';
import {mix, offset} from '@/utils/vectors';

export default function captureOutpost(
	trgtPos: Position[],
	busy: number[],
	nmidfarmers: number,
): void {
	const {_spirits} = data;
	const {friends} = _spirits;
	const p0 = _points.middle.between;
	const p2 = offset(enemy_base.position, base.position, 380);
	const p1 = mix(p0, p2);
	const p3 = _points.enemybase.inrange;
	const ps = [p0, p1, p2, p3];

	if (_stage === 1) {
		for (const p of ps) {
			for (let n = 0; n < nmidfarmers / 2; n++) {
				moveClosest(trgtPos, p, busy);
			}
		}
	}

	for (const sp of getAvailableSpirits(friends, busy)) {
		moveClosest(trgtPos, p3, busy);
	}
}
