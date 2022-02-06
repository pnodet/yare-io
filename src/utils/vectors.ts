/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Sum values of v
 */
export const sum = (v: number[]): number => v.reduce((a, b) => a + b, 0);

/**
 * Return a vector that points from p1 to p2.
 */
const vectorFromPos = (p1: Position, p2: Position): Vector => [
	p2[0] - p1[0],
	p2[1] - p1[1],
];

/**
 * Return a unitvector that points from p1 to p2.
 */
const normalizeTo = (p1: Position, p2: Position): Position =>
	normalize(vectorFromPos(p1, p2)) as Position;

export const dist = (p1: Position, p2: Position): number =>
	vectorLength(vectorFromPos(p1, p2));

/**
 * ```raw
 * True if distance between p1 and p2 is less than d.
 *
 * default d=200 which is ship range
 * ```
 */
export const isWithinDist = (
	p1: Position,
	p2: Position,
	range = 200,
): boolean => dist(p1, p2) <= range;

/**
 * Length of a vector
 */
const vectorLength = (v: Vector): number => Math.hypot(v[0], v[1]);

const normalize = (v: Vector): Vector => [
	v[0] / vectorLength(v),
	v[1] / vectorLength(v),
];

const dot = (v1: Position, v2: Position): number =>
	v1[0] * v2[0] + v1[1] * v2[1];

/**
 * Normalization followed by dot product gives a measure of direction similarity
 */
const directionSimilarity = (v1: Position, v2: Position): number =>
	dot(normalize(v1) as Position, normalize(v2) as Position);

/**
 * [v1[0] + v2[0], v1[1] + v2[1]]
 */
const add = (v1: Vector, v2: Vector): Vector => [v1[0] + v2[0], v1[1] + v2[1]];

/**
 * [v[0] * k, v[1] * k]
 */
const mul = (v: Vector, k: number): Vector => [v[0] * k, v[1] * k];

/**
 * Clamp x to lie in a..b range
 */
const clamp = (x: number, a: number, b: number): number =>
	Math.min(b, Math.max(a, x));

const clamp01 = (x: number): number => clamp(x, 0, 1);

/**
 * ```raw
 * Return a point that lies fraction t from p1 toward p2, default t=0.5
 * ```
 */
export const mix = (p1: Position, p2: Position, t = 0.5): Position => {
	const v = vectorFromPos(p1, p2);
	const v_scaled = mul(v, clamp01(t)); // Might not want to clamp t?
	const p = add(p1, v_scaled) as Position;
	return p;
};

/**
 * ```raw
 * Return a point that lies distance d away from p1, in the direction of p2.
 * note: d can be negative
 * ```
 */
export const offset = (p1: Position, p2: Position, d: number): Position => {
	if (Math.abs(d) < 0.000_000_001) {
		return p1;
	}

	const unitvec = normalizeTo(p1, p2);
	const v = mul(unitvec, d);
	const p = add(p1, v) as Position;
	return p;
};

/**
 *```raw
 * The points where a line from p1 would tangent a circle at center p2 with radius r
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no tangentpoint exist. (it means p1 is inside the circle)
 * ```
 */
const tangentPoints = (p: Position, c: Position, r: number): Position[] => {
	// https://math.stackexchange.com/questions/543496/how-to-find-the-equation-of-a-line-tangent-to-a-circle-that-passes-through-a-g
	const dx = p[0] - c[0];
	const dy = p[1] - c[1];

	const dxr = -dy;
	const dyr = dx;

	const d = Math.sqrt(dx * dx + dy * dy);
	if (d < r) {
		return []; // No tangentpoints (p is inside circle c)
	}

	const rho = r / d;
	const ad = rho * rho;
	const bd = rho * Math.sqrt(1 - rho * rho);

	const t1x = c[0] + ad * dx + bd * dxr;
	const t1y = c[1] + ad * dy + bd * dyr;
	const t2x = c[0] + ad * dx - bd * dxr;
	const t2y = c[1] + ad * dy - bd * dyr;

	// Tangentpoints
	const tp1: Position = [t1x, t1y];
	const tp2: Position = [t2x, t2y];
	return [tp1, tp2];
};

/**
 * Return either vector v1 or v2
 *
 * whichever points in the direction most similar to the direciton of vector v
 */
const mostSimilarVec = (v1: Position, v2: Position, v: Position): Position => {
	const s1 = directionSimilarity(v, v1);
	const s2 = directionSimilarity(v, v2);
	const mostSimilar = s1 > s2 ? v1 : v2;
	return mostSimilar;
};

/**
 * Return the minimum value and its index in vector vec
 * (return value: Infinity if vec=[])
 */
export const minimum = (vec: number[]): {value: number; index: number} => {
	if (vec.length === 0) return {value: Number.POSITIVE_INFINITY, index: -1};
	let value = vec[0];
	let index = 0;
	for (let i = 1; i < vec.length; i++) {
		if (vec[i] < value) {
			value = vec[i];
			index = i;
		}
	}

	return {value, index};
};

/**
 * ```raw
 * Where a circle at p1 with radius r1 intersects a circle at p2 with radius r2.
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no intersection exist.
 * ```
 */
export const intersectTwoCircles = (
	p1: Position,
	r1: number,
	p2: Position,
	r2: number,
): Position[] => {
	// https://gist.github.com/jupdike/bfe5eb23d1c395d8a0a1a4ddd94882ac
	const x1 = p1[0];
	const y1 = p1[1];
	const x2 = p2[0];
	const y2 = p2[1];
	const centerdx = x1 - x2;
	const centerdy = y1 - y2;
	const R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
	if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) {
		return []; // No intersections
	}
	// Intersection(s) should exist

	const R2 = R * R;
	const R4 = R2 * R2;
	const a = (r1 * r1 - r2 * r2) / (2 * R2);
	const r2r2 = r1 * r1 - r2 * r2;
	const c = Math.sqrt((2 * (r1 * r1 + r2 * r2)) / R2 - (r2r2 * r2r2) / R4 - 1);

	const fx = (x1 + x2) / 2 + a * (x2 - x1);
	const gx = (c * (y2 - y1)) / 2;
	const ix1 = fx + gx;
	const ix2 = fx - gx;

	const fy = (y1 + y2) / 2 + a * (y2 - y1);
	const gy = (c * (x1 - x2)) / 2;
	const iy1 = fy + gy;
	const iy2 = fy - gy;

	// Note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
	// but that one solution will just be duplicated as the code is currently written
	return [
		[ix1, iy1],
		[ix2, iy2],
	];
};

/**
 * ```raw
 * Return a point adjusted_p the ship can move to that avoids the circle c with radius r
 *
 * 1. If moving will NOT put ship inside: just move
 * 2. IF INSIDE:
 *  2.1 if near edge: go diagonal (land on circumference) in the direction most similar to desired_p
 *  2.2 if further in: go straight outward from circle center
 * 3. IF OUTSIDE:
 *  3.1 (if step1 wasnt triggered) go along tangent direction most similar to desired_p
 *```
 */
export const avoidCircle = (
	currentPosition: Position,
	desiredPosition: Position,
	circle: Position,
	radius: number,
): Position => {
	const pMoved = offset(
		currentPosition,
		desiredPosition,
		Math.min(20, dist(currentPosition, desiredPosition)),
	);
	if (dist(circle, pMoved) > radius) {
		// Moving wont put ship inside.. just move.
		return pMoved;
	}

	const dir_desired = normalizeTo(currentPosition, desiredPosition);
	// Const dir_center = unitvecFromPositions(position, c);
	const tps = tangentPoints(currentPosition, circle, radius);
	if (tps.length === 0) {
		// Inside.
		if (dist(circle, currentPosition) > radius - 20) {
			// Ship is pretty close to circumference, there exists 2 "diagonal" moves to get outside
			// choose the one most similar to dir_desired
			const ps = intersectTwoCircles(circle, radius, currentPosition, 20);
			const diag0 = normalizeTo(currentPosition, ps[0]);
			const diag1 = normalizeTo(currentPosition, ps[1]);
			const diag = mostSimilarVec(diag0, diag1, dir_desired);

			const p_diag = add(currentPosition, mul(diag, 20)) as Position;
			return p_diag;
		}

		// Otherwise straight out
		return offset(circle, currentPosition, radius);
	}

	// Outside, there exists 2 tangent points
	// choose the one most similar to dir_desired
	const dir_tangent0 = normalizeTo(currentPosition, tps[0]);
	const dir_tangent1 = normalizeTo(currentPosition, tps[1]);
	const s0 = directionSimilarity(dir_tangent0, dir_desired);
	const s1 = directionSimilarity(dir_tangent1, dir_desired);
	const p_tangent = s0 > s1 ? tps[0] : tps[1];
	const p_tangent_moved = offset(currentPosition, p_tangent, 20);
	return p_tangent_moved;
};

/**
 * Return a boolean vector filled with false
 */
export const falses = (length: number): boolean[] =>
	Array.from({length}).fill(false) as boolean[];

/**
 * Return true if all elements in v are true
 */
export const all = (v: boolean[]): boolean => v.every(x => x);

/**
 * Return true if any element in v is true
 */
export const any = (v: boolean[]): boolean => v.includes(true);

/**
 * Return a new vector of length n, filled with x (default x=0)
 */
export const newVec = (length: number, x = 0): Vector =>
	Array.from({length}).fill(x) as Vector;

/**
 * Modifies v.
 *
 * Remove first item from and return it.
 * (v.pop() removes last item and returns it)
 */
export const popfirst = (v: Vector): number => {
	const x = v.shift();
	if (x === undefined) {
		return -1; // Make typescript happy
	}

	return x;
};

/**
 * Modifies v.
 *
 * Put x at the begining of v and return v
 *  * (v.push(x) puts x at end)
 */
export const pushfirst = (v: Vector, x: number): Vector => (v.unshift(x), v);

export const weightedmean = (
	points: Position[],
	weights: number[],
): Position => {
	const x = sum(points.map((p, i) => weights[i] * p[0]));
	const y = sum(points.map((p, i) => weights[i] * p[1]));
	const weightsum = sum(weights);
	const pos = [x / weightsum, y / weightsum] as Position;
	return pos;
};

/**
 * Return the point in the vector ps=[p1,p2,p2] that is closest to target point targetpoint
 */
export const nearestPointOfPoints = (
	ps: Position[],
	targetpoint: Position,
): Position => {
	const d = ps.map(p => dist(p, targetpoint));
	const i = minimum(d).index;
	return ps[i];
};

/**
 * A*x^2 + B*x + C = 0
 * return [x1,x2]
 */
const quadraticroots = (A: number, B: number, C: number) => {
	const r = Math.sqrt(B * B - 4 * A * C);
	const x1 = (-B + r) / (2 * A);
	const x2 = (-B - r) / (2 * A);
	return [x1, x2];
};

/**
 * ```raw
 * return two points [a, b] where (infinite) line created by p1->p2 intersects circle with center center and radius r.
 *
 * note: return empty list [] if no intersection exist.
 * ```
 */
export const intersectLineCircle = (
	p1: Position,
	p2: Position,
	center: Position,
	r: number,
): Position[] => {
	// https://math.stackexchange.com/questions/228841/how-do-i-calculate-the-intersections-of-a-straight-line-and-a-circle
	const x1 = p1[0];
	const y1 = p1[1];
	const x2 = p2[0];
	const y2 = p2[1];

	const p = center[0];
	const q = center[1];

	if (x1 === x2) {
		// Vertical line
		const k = x1;
		const A = 1;
		const B = -2 * q;
		const C = p * p + q * q - r * r - 2 * k * p + k * k;
		if (B * B - 4 * A * C < 0) {
			// No intersection
			return [];
		}

		const [y_1, y_2] = quadraticroots(A, B, C);
		return [
			[k, y_1],
			[k, y_2],
		];
	}

	const m = (y2 - y1) / (x2 - x1);
	const c = y1 - m * x1;

	const A = m * m + 1;
	const B = 2 * (m * c - m * q - p);
	const C = q * q - r * r + p * p - 2 * c * q + c * c;

	if (B * B - 4 * A * C < 0) {
		// No intersection
		return [];
	}

	const [x_1, x_2] = quadraticroots(A, B, C);

	// Y = m*x + c
	const y_1 = m * x_1 + c;
	const y_2 = m * x_2 + c;
	return [
		[x_1, y_1],
		[x_2, y_2],
	];
};
