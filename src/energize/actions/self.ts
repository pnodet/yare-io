import data from '@/data';
import {
	getAvailableSpirits,
	getMaxFarmers,
	getSpiritsInRange,
	getSustainableFarmers,
	myOutpostEnergy,
	sustainableStarEnergy,
	transferamount,
} from '@/utils/functions';
import {canTransfer, notFull, _stage} from '@/utils/state';
import {isWithinDist} from '@/utils/vectors';

const {_spirits, _stars} = data;
const {friends, enemies} = _spirits;

const energize_star = (
	targets: Entity[],
	star: Star,
	busy: number[],
	nfarmers: number,
	attacking: number[],
): void => {
	const sustainableEnergy = sustainableStarEnergy(
		star,
		nfarmers,
		friends[0].size,
	);
	let currentEnergy = star.energy;
	if (currentEnergy < sustainableEnergy) {
		const ships = friends.filter(
			s =>
				isWithinDist(star.position, s.position) &&
				getSpiritsInRange(s.position, enemies, 400).length === 0 &&
				canTransfer(s),
		);

		for (const [i, ship] of ships.entries()) {
			if (currentEnergy < sustainableEnergy) {
				targets[ship.index] = star;
				busy.push(ship.index);
				attacking.push(ship.index);
				currentEnergy += transferamount(ship);
				ship.shout('c');
			}
		}
	}
};

const essentially9 = (): boolean =>
	friends.length === 9 || (friends.length === 8 && base.energy >= 87);

/**
 * Take energy from star, every other tick
 */
const energize_self = (
	targets: Entity[],
	star: Star,
	busy: number[],
	attacking: number[],
	stayfull = false,
): void => {
	const ships = getAvailableSpirits(friends, busy.concat(attacking)).filter(s =>
		isWithinDist(star.position, s.position),
	);

	const N_max =
		myOutpostEnergy() > 600 ? getMaxFarmers(star, friends[0].size) : 999;
	const maxselfers = N_max / 2;
	let nselfers = 0;

	const shoulEven = (s: Spirit) => notFull(s) && nselfers < maxselfers;
	const shouldOdd = (s: Spirit) =>
		notFull(s) &&
		(stayfull || getSpiritsInRange(s.position, enemies, 400).length > 0);

	const haveEssentially9ships = essentially9();
	for (const [i, ship] of ships.entries()) {
		if ((tick + i) % 2 === 0) {
			if (shoulEven(ship)) {
				targets[ship.index] = ship;
				nselfers += 1;
				if (star.energy > 2 || stayfull) {
					// Only make it busy if worthwile not to override
					busy.push(ship.index);
				}
			}
		} else if (shouldOdd(ship)) {
			targets[ship.index] = ship;
			nselfers += 1;
			/* FIXME:
				if (
					(star.energy > 2 || stayfull) && // Only make the odd busy if on square rush specific scenario
					memory.enemyIsSquareRush &&
					haveEssentially9ships
				) {
					busy.push(ship.index);
				} */
		}
	}
};

export default function energizeSelf(
	targets: Entity[],
	busy: number[],
	attacking: number[],
	nfarmers: number,
	nmidfarmers: number,
): void {
	const Nhome = getSustainableFarmers(_stars.me, friends[0].size);
	const Nhome_max = getMaxFarmers(_stars.me, friends[0].size);

	const Nmid = getSustainableFarmers(_stars.middle, friends[0].size);
	const Nmid_max = getMaxFarmers(_stars.middle, friends[0].size);

	energize_star(targets, _stars.me, busy, nfarmers, attacking);

	if (myOutpostEnergy() > 600 && nmidfarmers >= Nmid_max) {
		energize_star(targets, _stars.middle, busy, nmidfarmers, attacking);
	}

	energize_self(targets, _stars.me, busy, attacking, false);

	const stayfullmidstar =
		(_stage === 0 && myOutpostEnergy() > 30) ||
		(_stage === 1 && myOutpostEnergy() > 200 && nfarmers < Nmid);
	energize_self(targets, _stars.middle, busy, attacking, stayfullmidstar);

	const stayfullenemystar = true;
	energize_self(targets, _stars.enemy, busy, attacking, stayfullenemystar);
}
