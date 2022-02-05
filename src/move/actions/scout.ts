import data from '@/data';
import {moveClosest} from '@/move/helpers';

export default function scout(trgtPos: Position[], busy: number[]): void {
	const {_stars} = data;
	const scoutPoint: Position =
		_stars.me === star_a1c
			? [enemy_base.position[0] + 340, enemy_base.position[1] - 200]
			: [enemy_base.position[0] - 300, enemy_base.position[1] + 250];

	moveClosest(trgtPos, scoutPoint, busy);
}
