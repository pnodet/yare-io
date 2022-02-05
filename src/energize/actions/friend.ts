import data from '@/data';
import {constructGraph, getPathByClosestAvailableDestination} from '@/graph';
import {
	getAvailableSpirits,
	getMaxFarmers,
	getSpiritsInRange,
	sortByNearestEnemyDistance,
} from '@/utils/functions';
import {
	canTransfer,
	hasRoom,
	notNearStar,
	requestedHeals,
	_stage,
} from '@/utils/state';
import {all, isWithinDist} from '@/utils/vectors';

const {_spirits, _stars} = data;
const {friends, enemies} = _spirits;

const shouldHealNonAttackers = (nfarmers: number): boolean => {
	const enemyIsNearBase = getSpiritsInRange(base.position, enemies, 600);
	const Nhome_max = getMaxFarmers(_stars.me, friends[0].size);

	const shouldHealFriends =
		_stage > 0 || enemyIsNearBase.length > 0 || nfarmers >= Nhome_max;
	return shouldHealFriends;
};

const energize_nearstar2friends = (
	targets: Entity[],
	shipsRequiringHeal: Spirit[],
	star: Star,
	busy: number[],
	dontHealIndexes: number[] = [],
): void => {
	if (shipsRequiringHeal.length === 0) return;

	const shipsrequiringheal_indexes = shipsRequiringHeal.map(s => s.index);

	const sources = getAvailableSpirits(
		friends,
		busy.concat(shipsrequiringheal_indexes),
	).filter(s => isWithinDist(star.position, s.position) && canTransfer(s));

	for (const src of sources) {
		const graphships = getAvailableSpirits(
			friends,
			busy.concat(dontHealIndexes),
		);

		if (graphships.length > 0) {
			const G = constructGraph(graphships);
			const destinations = getAvailableSpirits(
				shipsRequiringHeal,
				busy.concat(dontHealIndexes),
			);
			const pathships = getPathByClosestAvailableDestination(
				graphships,
				G,
				src,
				destinations,
			);

			if (pathships.length > 1) {
				const transferships = pathships.slice(0, -1);
				const canReach = all(transferships.map(s => canTransfer(s)));
				if (canReach) {
					for (let i = 0; i < pathships.length - 1; i++) {
						targets[pathships[i].index] = pathships[i + 1];
						busy.push(pathships[i].index);
					}

					const dest = pathships[pathships.length - 1];
					dontHealIndexes.push(dest.index);
				}
			}
		}
	}
};

const energizeFromNonStar = (
	targets: Entity[],
	busy: number[],
	shipsRequiringHeal: Spirit[],
	dontHealIndexes: number[] = [],
): void => {
	if (shipsRequiringHeal.length === 0) return;
	const shipsrequiringheal_indexes = shipsRequiringHeal.map(s => s.index);

	const sources = getAvailableSpirits(
		friends,
		busy.concat(shipsrequiringheal_indexes),
	).filter(
		s =>
			!isWithinDist(_stars.me.position, s.position) &&
			!isWithinDist(_stars.middle.position, s.position) &&
			canTransfer(s),
	);
	for (const src of sources) {
		const graphships = getAvailableSpirits(
			friends,
			busy.concat(dontHealIndexes),
		);

		if (graphships.length > 0) {
			const G = constructGraph(graphships);
			const destinations = getAvailableSpirits(
				shipsRequiringHeal,
				busy.concat(dontHealIndexes),
			);
			// The way Im doing it now prevents a destination from being healed more than once...
			const pathships = getPathByClosestAvailableDestination(
				graphships,
				G,
				src,
				destinations,
			);

			if (pathships.length > 1) {
				const transferships = pathships.slice(0, -1); // All except destination
				const canReach = all(transferships.map(s => canTransfer(s)));
				if (canReach) {
					for (let i = 0; i < pathships.length - 1; i++) {
						targets[pathships[i].index] = pathships[i + 1];
						busy.push(pathships[i].index);
					}

					const dest = pathships[pathships.length - 1];
					dontHealIndexes.push(dest.index);
				}
			}
		}
	}
};

const energizeFromStar = (
	targets: Entity[],
	busy: number[],
	shipsRequiringHeal: Spirit[],
	dontHealIndexes: number[],
): void => {
	energize_nearstar2friends(
		targets,
		shipsRequiringHeal,
		_stars.enemy,
		busy,
		dontHealIndexes,
	);
	energize_nearstar2friends(
		targets,
		shipsRequiringHeal,
		_stars.middle,
		busy,
		dontHealIndexes,
	);
	energize_nearstar2friends(
		targets,
		shipsRequiringHeal,
		_stars.me,
		busy,
		dontHealIndexes,
	);
};

/**
 * 1. heal my attacking ships (they always have room for 1 heal if they attack)
 *  1.1 from star source
 *  1.2 from non-star source
 * 2. heal my attacking ships again (if they had room for 1 heal right now it means they can be healed twice)
 *  1.1 from star source
 *  1.2 from non-star source
 * 3. heal my non-attacking ships if they are not near star
 *  3.1 sorted by distance to its nearest enemy and heal fully.
 */
export default function energizeFriend(
	targets: Entity[],
	busy: number[],
	attacking: number[],
	nfarmers: number,
): void {
	const healed_once_indexes: number[] = [];
	const myshipsattacking = getAvailableSpirits(friends, attacking);
	// 1.
	energizeFromStar(targets, busy, myshipsattacking, healed_once_indexes);
	energizeFromNonStar(targets, busy, myshipsattacking, healed_once_indexes);

	// 2
	const healed_twice_indexes: number[] = [];
	const myshipsattacking2 = myshipsattacking.filter(s => hasRoom(s));
	energizeFromStar(targets, busy, myshipsattacking2, healed_twice_indexes);
	energizeFromNonStar(targets, busy, myshipsattacking2, healed_twice_indexes);

	// 3.
	const shouldHeal = shouldHealNonAttackers(nfarmers);
	const myshipsNotattackingNotNearstar = sortByNearestEnemyDistance(
		getAvailableSpirits(friends, attacking).filter(s => notNearStar(s)),
	);
	const Nhealsrequired = myshipsNotattackingNotNearstar.map(s =>
		requestedHeals(s),
	);

	if (shouldHeal) {
		for (const [i, spirit] of myshipsNotattackingNotNearstar.entries()) {
			for (let n = 0; n < Nhealsrequired[i]; n++) {
				const dontHealIndexes: number[] = [];
				energizeFromStar(targets, busy, [spirit], dontHealIndexes);
			}
		}
	}
}
