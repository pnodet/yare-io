import data from '@/data';
import {getShipCost, getSpiritsInRange} from '@/utils/functions';
import {_stage} from '@/utils/state';
import _points from '@/data-points';
import evaluateBattle from '@/battle-eval';
import {
	any,
	avoidCircle,
	dist,
	isWithinDist,
	offset,
	weightedmean,
} from '@/utils/vectors';

const {_spirits, _stars} = data;
const {friends, enemies} = _spirits;
const MINADVANTAGE = -1;

/**
 * A Ship can only move 20 units. make targetps reflect that.
 */
function clamp_movement(targetps: Position[]): void {
	for (const [i, ship] of friends.entries()) {
		if (targetps[i]) {
			const d = Math.min(20, dist(ship.position, targetps[i]));
			targetps[i] = offset(ship.position, targetps[i], d);
		} else {
			targetps[i] = ship.position;
		}
	}

	// Avoid structures
	for (const [i, ship] of friends.entries()) {
		targetps[i] = avoidCircle(
			ship.position,
			targetps[i],
			_stars.middle.position,
			_stars.middle.collision_radius,
		);

		targetps[i] = avoidCircle(
			ship.position,
			targetps[i],
			_stars.enemy.position,
			_stars.enemy.collision_radius,
		);

		targetps[i] = avoidCircle(
			ship.position,
			targetps[i],
			_stars.me.position,
			_stars.me.collision_radius,
		);

		targetps[i] = avoidCircle(
			ship.position,
			targetps[i],
			outpost.position,
			outpost.collision_radius,
		);

		targetps[i] = avoidCircle(
			ship.position,
			targetps[i],
			base.position,
			base.collision_radius,
		);

		targetps[i] = avoidCircle(
			ship.position,
			targetps[i],
			enemy_base.position,
			enemy_base.collision_radius,
		);
	}
}

/**
 * ```raw
 * Mean positions of ships, weighted by their energy + shipcost
 *
 * note: Use ship.position as default position but can use other positions such as intended future position
 * ```
 */
const valueWeightedMean = (
	spirits_: Spirit[],
	shipcost: number,
	positions = spirits_.map(s => s.position),
) => {
	const valueWeights = spirits_.map(s => s.energy + shipcost);
	return weightedmean(positions, valueWeights);
};

function attack(
	trgtPos: Position[],
	alreadyHasOrders: number[],
	enemiesRange: number,
	friendsRange: number,
	offsetRange: number,
): void {
	const newTrgtPos: Position[] = Array.from({
		length: trgtPos.length,
	}).fill(null) as Position[];

	const enemyshipcost = getShipCost(enemy_base);
	const myshipcost = getShipCost(base);

	for (const spirit of friends) {
		const nearbyEnemies = getSpiritsInRange(
			spirit.position,
			enemies,
			enemiesRange,
		);

		const nearbyFriends = getSpiritsInRange(
			spirit.position,
			friends,
			friendsRange,
		);
		const nearbyFriendsIncludingSelf = [spirit, ...nearbyFriends];

		if (nearbyEnemies.length === 0 || alreadyHasOrders.includes(spirit.index)) {
			continue;
		}

		const battleEval = evaluateBattle(nearbyFriends, nearbyEnemies);

		const friendTargetPositions = nearbyFriendsIncludingSelf.map(
			s => trgtPos[s.index],
		);
		const enemyValuePoint = valueWeightedMean(nearbyEnemies, enemyshipcost);
		const friendValuePoint = valueWeightedMean(
			nearbyFriendsIncludingSelf,
			myshipcost,
			friendTargetPositions,
		);

		const continueAsPlannedisDangerous = any(
			enemies.map(s => isWithinDist(s.position, trgtPos[spirit.index], 220)),
		);

		if (continueAsPlannedisDangerous) {
			if (battleEval >= MINADVANTAGE) {
				for (const friend of nearbyFriends) {
					newTrgtPos[friend.index] = offset(
						enemyValuePoint,
						friendValuePoint,
						180,
					);
					alreadyHasOrders.push(friend.index);
				}
			} else {
				newTrgtPos[spirit.index] = offset(
					enemyValuePoint,
					friendValuePoint,
					offsetRange,
				);
				alreadyHasOrders.push(spirit.index);
			}
		}
	}

	for (let i = 0; i < trgtPos.length; i++) {
		if (newTrgtPos[i]) {
			trgtPos[i] = newTrgtPos[i];
		}
	}

	clamp_movement(trgtPos);
}

export default function combat(trgtPos: Position[]): void {
	const alreadyHasOrders: number[] = [];
	clamp_movement(trgtPos);
	attack(trgtPos, alreadyHasOrders, 200, 20, 220);
	attack(trgtPos, alreadyHasOrders, 220, 40, 240);
	attack(trgtPos, alreadyHasOrders, 240, 60, 260);
}
