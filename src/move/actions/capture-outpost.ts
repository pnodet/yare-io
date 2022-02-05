import data from '@/data';
import {getClose, getAvailableSpirits} from '@/utils/functions';
import evaluateBattle from '@/battle-eval';
import {moveClosest} from '@/move/helpers';

export default function captureOutpost(
	trgtPos: Position[],
	busy: number[],
): void {
	const {_spirits, _players} = data;
	const {friends, enemies} = _spirits;

	const enemiesAroundOutpost = outpost.sight.enemies.filter(id =>
		id.startsWith(_players.enemy),
	);
}
