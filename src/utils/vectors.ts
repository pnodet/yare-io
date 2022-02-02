/**
 * Return a vector that points from p1 to p2.
 */
const vectorTo = (p1: Position, p2: Position): Vector => [
	p2[0] - p1[0],
	p2[1] - p1[1],
];

/**
 * Length of a vector
 */
const vectorLength = (v: Vector): number => Math.hypot(v[0], v[1]);

const normalize = (v: Vector): Vector => {
	const _length = vectorLength(v);
	return [v[0] / _length, v[1] / _length];
};

/**
 * X = v1[0] + v2[0]
 * y = v1[1] + v2[1]]
 */
const add = (v1: Vector, v2: Vector): Vector => [v1[0] + v2[0], v1[1] + v2[1]];

/**
 * X = v[0] * k
 * y = v[1] * k]
 */
const mul = (v: Vector, k: number): Vector => [v[0] * k, v[1] * k];
