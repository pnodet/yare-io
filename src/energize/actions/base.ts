import data from '@/data';
import {constructGraph, getPathByClosestAvailableDestination} from '@/graph';
import {
	getAvailableSpirits,
	getMaxFarmers,
	getSpiritsInRange,
} from '@/utils/functions';
import {canTransfer, isFull} from '@/utils/state';
import {all, isWithinDist} from '@/utils/vectors';

const {_spirits, _stars} = data;
const {friends, enemies} = _spirits;

const harvestStar = (
	targets: Entity[],
	star: Star,
	busy: number[],
	attacking: number[],
	condition = (s: Spirit) => isFull(s),
) => {
	const sources = getAvailableSpirits(friends, busy.concat(attacking)).filter(
		s => isWithinDist(star.position, s.position) && condition(s),
	);
	const shipsnearbase = getAvailableSpirits(
		friends,
		busy.concat(attacking),
	).filter(s => isWithinDist(base.position, s.position));

	for (const src of sources) {
		const ships = getAvailableSpirits(friends, busy.concat(attacking));

		if (ships.length > 0) {
			const G = constructGraph(ships);
			const destinations = getAvailableSpirits(shipsnearbase, busy);
			const pathships = getPathByClosestAvailableDestination(
				ships,
				G,
				src,
				destinations,
			);

			if (pathships.length > 1) {
				for (let i = 0; i < pathships.length - 1; i++) {
					if (condition(pathships[i])) {
						targets[pathships[i].index] = pathships[i + 1];
						busy.push(pathships[i].index);
					} else {
						break;
					}
				}

				const dest = pathships[pathships.length - 1];
				if (condition(dest)) {
					targets[dest.index] = base;
					busy.push(dest.index);
				}
			}
		}
	}
};

const harvestAnyStar = (targets: Entity[], busy: number[]) => {
	const sources = getAvailableSpirits(friends, busy).filter(
		s => canTransfer(s) && !isWithinDist(base.position, s.position),
	);

	const shipsnearbase = getAvailableSpirits(friends, busy).filter(s =>
		isWithinDist(base.position, s.position),
	);

	for (const src of sources) {
		const graphships = getAvailableSpirits(friends, busy);

		if (graphships.length > 0) {
			const G = constructGraph(graphships);
			const destinations = getAvailableSpirits(shipsnearbase, busy);
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
					targets[dest.index] = base;
					busy.push(dest.index);
				}
			}
		}
	}

	for (const ship of shipsnearbase) {
		targets[ship.index] = base;
		busy.push(ship.index);
	}
};

export default function energizeBase(
	targets: Entity[],
	busy: number[],
	attacking: number[],
	nfarmers: number,
): void {
	const enemyIsNearBase = getSpiritsInRange(base.position, enemies, 420);
	const Nhome_max = getMaxFarmers(_stars.me, friends[0].size);

	const shouldHealBeforeTransferring = nfarmers >= Nhome_max;
	let transferCondition = (s: Spirit) => canTransfer(s);
	if (shouldHealBeforeTransferring) {
		transferCondition = (s: Spirit) => isFull(s);
	}

	harvestStar(targets, _stars.me, busy, attacking, transferCondition);
	harvestStar(targets, _stars.middle, busy, attacking, transferCondition);

	if (!shouldHealBeforeTransferring && enemyIsNearBase.length === 0)
		harvestAnyStar(targets, busy);
}
