const patrolPoints: Position[] = [];

/**
 * @function getPatrolPoints
 * Create a circle around base
 * @param {number} radius size of the circle
 * @returns {Position[]} array of coordinates
 */
const getPatrolPoints = (radius = 220): Position[] => {
	if (patrolPoints.length === 0) {
		const centerX = base.position[0];
		const centerY = base.position[1];
		const steps = Math.round((2 * Math.PI * radius) / 62);

		for (let i = 0; i < steps; i++) {
			const x = centerX + radius * Math.cos(i);
			const y = centerY + radius * Math.sin(i);
			patrolPoints.push([Math.round(x), Math.round(y)]);
		}
	}

	return patrolPoints;
};

/**
 * @function getPatrolPoint
 * @param {number} index
 * @returns {Position} Next patrol point
 */
export const getPatrolPoint = (index: number): Position => [
	Math.round(getPatrolPoints()[index][0]),
	Math.round(getPatrolPoints()[index][1]),
];

/**
 * @function getPatrolLength
 * @returns {number} Number of patrol points
 */
export const getPatrolLength = (): number => getPatrolPoints().length;
