/* eslint-disable @typescript-eslint/naming-convention */
import {myOutpostEnergy} from './utils/functions';
import data from '@/data';
import {
	offset,
	nearestPointOfPoints,
	intersectLineCircle,
	dist,
	intersectTwoCircles,
	mix,
} from '@/utils/vectors';

const range = 199.999;

const getHomeFarm = () => {
	const {_stars} = data;
	const o = 60; // Offset away from straight line
	const pf = offset(base.position, enemy_base.position, o);
	const p0f = offset(_stars.me.position, pf, range);
	const p1f = offset(p0f, pf, range);
	const p2f = offset(p1f, pf, range);

	const base_towardstar_f = nearestPointOfPoints(
		intersectLineCircle(p2f, p1f, base.position, range),
		_stars.me.position,
	);

	const forward = {
		star: p0f,
		between: p1f,
		base: p2f,
		base_towardstar: base_towardstar_f,
	};

	const pb = offset(base.position, enemy_base.position, -o);
	const p0b = offset(_stars.me.position, pb, range);
	const p1b = offset(p0b, pb, range);
	const p2b = offset(p1b, pb, range);

	const base_towardstar_b = nearestPointOfPoints(
		intersectLineCircle(p2b, p0b, base.position, range),
		_stars.me.position,
	);
	const between_towardstar_b = offset(
		base_towardstar_b,
		_stars.me.position,
		range,
	);

	const backward = {
		star: p0b,
		between: p1b,
		between_towardstar: between_towardstar_b,
		base: base_towardstar_b,
	};

	return {forward, backward};
};

const insideMiddlestarInsideOutpost = () => {
	const {_stars} = data;
	const middlestar = _stars.middle.position;

	const pmid = intersectTwoCircles(middlestar, range, outpost.position, range);
	const d0 = dist(base.position, pmid[0]);
	const d1 = dist(base.position, pmid[1]);
	const pmid_me = d0 < d1 ? pmid[0] : pmid[1];
	const pmid_enemy = d0 < d1 ? pmid[1] : pmid[0];
	const pmid_between = mix(pmid_me, pmid_enemy, 0.5);
	return {
		me: pmid_me,
		between: pmid_between,
		enemy: pmid_enemy,
	};
};

const star2middlefarm = (): {
	home: {
		star: Position;
		between: Position;
		base: Position;
	};
	mid: {
		starforward: Position;
		star: Position;
		between: Position;
		base: Position;
	};
} => {
	const {_stars} = data;

	const centerpoints = insideMiddlestarInsideOutpost();
	const middle = centerpoints.me;
	const forwardmiddle = centerpoints.between;

	const star = offset(_stars.me.position, middle, range); // Near star
	const between = offset(star, middle, range); // Between
	const base_ = offset(base.position, between, range);

	const base2 = nearestPointOfPoints(
		intersectTwoCircles(base.position, range, base_, range),
		_stars.middle.position,
	);
	const between1 = offset(base2, middle, range);

	const home = {star, between, base: base_};
	const mid = {
		starforward: myOutpostEnergy() > 500 ? forwardmiddle : middle,
		star: middle,
		between: between1,
		base: base2,
	};
	return {home, mid};
};

const enemybasepoints = () => {
	const a = offset(enemy_base.position, base.position, 199.999);
	const b = offset(enemy_base.position, base.position, 399.999);

	return {
		inrange: a,
		insight: b,
	};
};

const getPoints = () => ({
	homefarm: getHomeFarm(),
	star2middlefarm: star2middlefarm(),
	middle: insideMiddlestarInsideOutpost(),
	enemybase: enemybasepoints(),
});

const _points = getPoints();
export default _points;
