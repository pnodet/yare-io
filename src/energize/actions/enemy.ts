import data from '@/data';
import {
	attackdmg,
	getAvailableSpirits,
	getSpiritsInRange,
	lossFromAttacking,
	sortByShipenergy,
	transferamount,
} from '@/utils/functions';
import {notEmpty} from '@/utils/state';
import {isWithinDist, sum} from '@/utils/vectors';

const {_spirits, _players} = data;
const {friends, enemies} = _spirits;

export default function enemy(targets: Entity[], attacking: number[]): void {
	energize_enemyship(targets, attacking);
	energize_enemybase(targets, attacking);
}

/**
 * Attack enemies in range, in a way that does not overkill an enemy.
 */
const energize_enemyship = (
	targets: Entity[],
	attacking: number[],
	assumeNheals = 1,
): void => {
	for (const enemy of sortByShipenergy(enemies)) {
		const inRangeFriends = getSpiritsInRange(enemy.position, friends);
		const availableFriends = getAvailableSpirits(inRangeFriends, attacking);
		const en = enemy.energy - lossFromAttacking(enemy);
		const enemyEnergy = en + assumeNheals * enemy.size;
		let dmgdealt = 0;
		for (const myship of availableFriends) {
			if (dmgdealt <= enemyEnergy && notEmpty(myship)) {
				targets[myship.index] = enemy;
				dmgdealt += attackdmg(myship);
				attacking.push(myship.index);
			}
		}
	}
};

/**
 * ```raw
 * Energize enemy base, in a way that does not overkill the base.
 *
 * Base only need to go below 0 energy for a total of 8 ticks over the course of the game.
 * ```
 */
const energize_enemybase = (targets: Entity[], attacking: number[]) => {
	const nearbyEnemyships = enemies.filter(s =>
		isWithinDist(s.position, enemy_base.position),
	);
	const potentialBaseHeal = sum(nearbyEnemyships.map(s => transferamount(s)));
	const baseattackerShips = getAvailableSpirits(friends, attacking).filter(s =>
		isWithinDist(s.position, enemy_base.position),
	);

	let dmgdealt = 0;
	for (const ship of baseattackerShips) {
		if (dmgdealt <= enemy_base.energy + potentialBaseHeal) {
			targets[ship.index] = enemy_base;
			dmgdealt += attackdmg(ship);
			attacking.push(ship.index);
		}
	}
};
