import {getClose, getSpiritFromIndex} from './utils/functions';
import {
	dist,
	falses,
	minimum,
	newVec,
	popfirst,
	pushfirst,
} from './utils/vectors';

type Graph = Map<number, number[]>;
/**
 * ```raw
 * construct a graph (Map) of indexes connecting ships.
 *
 * For example: G.get(0) is a list [2,3,5] of which ship indexes are within range of index 0
 * ```
 */
export const constructGraph = (spirits_: Spirit[]): Graph =>
	new Map(
		spirits_.map(s => [
			s.index,
			getClose.friends(s.position).map(spiritId => spirits[spiritId].index),
		]),
	);

const reconstructPath = (
	previous: Vector,
	src: number,
	dest: number,
): Vector => {
	const path = [dest];
	let i = dest;
	while (i !== src) {
		if (previous[i] > -1) {
			pushfirst(path, previous[i]);
			i = previous[i];
		} else {
			break;
		}
	}

	if (path[0] === src) {
		// If there is a path between src and dest, first item will be equal to src
		// However, dont actually keep self as first...
		// return path.slice(1);
		return path;
	}

	return [];
};

const solve = (G: Graph, src: number, dest: number) => {
	const visited = falses(G.size);
	visited[src] = true;

	const previous = newVec(G.size, -1);

	const q = [src];
	while (q.length > 0) {
		const node = popfirst(q); // Remove first from q
		const neighbors = G.get(node) ?? []; // If src isnt even in G

		for (const i of neighbors) {
			if (!visited[i]) {
				q.push(i);
				visited[i] = true;
				previous[i] = node;
			}
		}

		if (node === dest) break;
	}

	return previous;
};

/**
 * ```raw
 * Get the ships that make the shortest transfer path from src to dest
 *
 * Return a vector [src, ship1, ship2, dest]
 * or empty vector [] if no path exist to dest
 * ```
 */
export const path = (
	spirits_: Spirit[],
	G: Graph,
	srcship: Spirit,
	destship: Spirit,
): Spirit[] => {
	const previous = solve(G, srcship.index, destship.index);
	const path = reconstructPath(previous, srcship.index, destship.index);
	return path.map(i => getSpiritFromIndex(spirits_, i));
};

/**
 * ```raw
 * Get the ships that make the shortest transfer path from src
 * to the CLOSEST reachable destination of destinations.
 * (as compared by distance from src to destination)
 *
 *
 * Return a vector [src,ship1, ship2, dest]
 * or empty vector [] if no path exist to any of the desinations
 * ```
 */
export const getPathByClosestAvailableDestination = (
	spirits_: Spirit[],
	G: Graph,
	src: Spirit,
	destinations: Spirit[],
): Spirit[] => {
	const empty_pathships: Spirit[] = [];
	const available_pathships: Spirit[][] = [];

	for (const dest of destinations) {
		const pathships = path(spirits_, G, src, dest);
		if (pathships.length > 0) {
			available_pathships.push(pathships);
		}
	}

	if (available_pathships.length > 0) {
		const dest_distances: number[] = [];
		for (const pathships of available_pathships) {
			const dest = pathships[pathships.length - 1];
			dest_distances.push(dist(src.position, dest.position));
		}

		const i = minimum(dest_distances).index;
		return available_pathships[i];
	}

	return empty_pathships;
};
