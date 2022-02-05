import data from '@/data';
import _points from '@/data-points';
import {moveClosest} from '@/move/helpers';
import {
	getSustainableFarmers,
	getMaxFarmers,
	getAvailableSpirits,
	myOutpostEnergy,
} from '@/utils/functions';

import {isWithinDist} from '@/utils/vectors';

import {almostFull, almostEmpty, isFull, _stage} from '@/utils/state';

/**
 * For 1 or 2 ships
 */
const walkingFarm = (trgtPos: Position[], busy: number[]): void => {
	const {_stars, _spirits} = data;
	const {friends} = _spirits;
	const starpoint = _points.homefarm.forward.star;
	const basepoint = _points.homefarm.forward.base_towardstar;
	const availableFriends = getAvailableSpirits(friends, busy);
	for (const spirit of availableFriends) {
		const isnearhomestar = isWithinDist(spirit.position, _stars.me.position);
		const isnearbase = isWithinDist(spirit.position, base.position);
		if (isnearhomestar) {
			if (almostFull(spirit)) {
				trgtPos[spirit.index] = basepoint;
			} else {
				trgtPos[spirit.index] = starpoint;
			}
		} else if (isnearbase) {
			if (almostEmpty(spirit)) {
				trgtPos[spirit.index] = starpoint;
			} else {
				trgtPos[spirit.index] = basepoint;
			}
		} else if (isFull(spirit)) {
			trgtPos[spirit.index] = basepoint;
		} else {
			trgtPos[spirit.index] = starpoint;
		}

		busy.push(spirit.index);
	}
};

/**
 * For 3 or 4 ships
 */
const lowshipFarm = (trgtPos: Position[], busy: number[]): void => {
	const fp = _points.homefarm.forward;
	moveClosest(trgtPos, fp.star, busy);
	moveClosest(trgtPos, fp.between, busy);
	moveClosest(trgtPos, fp.base, busy);
	moveClosest(trgtPos, fp.star, busy);
};

/**
 * For starting ships (6-7)farming slightly better
 */
const startingFarm = (trgtPos: Position[], busy: number[]): void => {
	const fp = _points.homefarm.backward;
	moveClosest(trgtPos, fp.star, busy);
	moveClosest(trgtPos, fp.star, busy);
	moveClosest(trgtPos, fp.between, busy);
	moveClosest(trgtPos, fp.between, busy);
	moveClosest(trgtPos, fp.base, busy);
	moveClosest(trgtPos, fp.base, busy);
	moveClosest(trgtPos, fp.star, busy);
};

export default function farm(
	trgtPos: Position[],
	busy: number[],
): [number, number] {
	const {_stars, _spirits} = data;
	const {friends} = _spirits;

	const Nhome = getSustainableFarmers(_stars.me, friends[0].size);
	const Nhome_max = getMaxFarmers(_stars.me, friends[0].size);

	let nfarmers = 0;
	let nmidfarmers = 0;

	const availableFriends = getAvailableSpirits(friends, busy);

	if (_stage === 0) {
		const fp = _points.homefarm.forward;
		if (availableFriends.length <= 2) {
			walkingFarm(trgtPos, busy);
		} else if (availableFriends.length <= 4) {
			lowshipFarm(trgtPos, busy);
		} else if (friends.length <= 7 && tick < 18) {
			startingFarm(trgtPos, busy);
		} else {
			for (let n = 0; n < Nhome_max / 2; n++) {
				moveClosest(trgtPos, fp.star, busy);
				moveClosest(trgtPos, fp.between, busy);
				nfarmers += moveClosest(trgtPos, fp.base, busy);
				nfarmers += moveClosest(trgtPos, fp.star, busy);
			}

			for (const spirit of getAvailableSpirits(friends, busy)) {
				trgtPos[spirit.index] = _points.homefarm.forward.base;
				busy.push(spirit.index);
			}
		}
	} else if (_stage === 1) {
		for (let n = 0; n < Nhome / 2; n++) {
			const fph = _points.star2middlefarm.home;
			moveClosest(trgtPos, fph.star, busy);
			moveClosest(trgtPos, fph.between, busy);
			nfarmers += moveClosest(trgtPos, fph.base, busy);
			nfarmers += moveClosest(trgtPos, fph.star, busy);
			const fpm = _points.star2middlefarm.mid;
			nmidfarmers += moveClosest(trgtPos, fpm.star, busy);
			if (
				myOutpostEnergy() < 100 ||
				(myOutpostEnergy() > 600 && _stars.middle.energy > 500)
			) {
				moveClosest(trgtPos, fpm.between, busy);
				moveClosest(trgtPos, fpm.base, busy);
			}

			nmidfarmers += moveClosest(trgtPos, fpm.star, busy);
		}
	}

	return [nfarmers, nmidfarmers];
}
