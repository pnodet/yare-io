export const getMovingAverage = (values: number[], window = 60) => {
	let average = 0;
	let periods = 0;
	for (let index = values.length - window; index < values.length; index++) {
		if (index < 0) continue;
		const element = values[index];
		average += element;
		periods++;
	}

	return average / periods;
};

export const getDistance = (a: Structure | Spirit, b: Structure | Spirit) => {
	const dx = (a.position[0] - b.position[0]) ** 2;
	const dy = (a.position[1] - b.position[1]) ** 2;
	return Math.sqrt(dx + dy);
};

export const getPlayerId = {
	me: this_player_id,
	enemy: players.p1 === this_player_id ? players.p2 : players.p1,
};

const getClosestStar = (sp: Spirit): Star => {
	let starsArray = [star_zxq, star_a1c, star_p89];
	starsArray = starsArray.filter(star => tick > star.active_at);
	const distances = starsArray.map(star => getDistance(sp, star));
	const closest = starsArray[distances.indexOf(Math.min(...distances))];
	return closest;
};

const getClosestFriends = (sp: Spirit | Base): SpiritID[] => {
	const friends = sp.sight.friends
		.map(friendId => ({id: friendId, dist: getDistance(sp, spirits[friendId])}))
		.sort((a, b) => a.dist - b.dist)
		.map(friends => friends.id);
	return friends;
};

const getClosestEnemies = (sp: Spirit | Base): SpiritID[] => {
	const enemies = sp.sight.enemies
		.filter(enemyId => spirits[enemyId].hp > 0)
		.map(enemyId => ({id: enemyId, dist: getDistance(sp, spirits[enemyId])}))
		.sort((a, b) => a.dist - b.dist)
		.map(enemy => enemy.id);
	return enemies;
};

export const getClosest = {
	star: getClosestStar,
	friends: getClosestFriends,
	enemies: getClosestEnemies,
};

const getLowestFriends = (sp: Spirit | Base): SpiritID[] => {
	const friends = sp.sight.friends
		.filter(friendId => spirits[friendId].hp > 0)
		.map(friendId => ({id: friendId, energy: spirits[friendId].energy}))
		.sort((a, b) => a.energy - b.energy)
		.map(friends => friends.id);
	return friends;
};

const getLowestEnemies = (sp: Spirit | Base): SpiritID[] => {
	const enemies = sp.sight.enemies
		.map(enemyId => ({id: enemyId, hp: spirits[enemyId].hp}))
		.sort((a, b) => a.hp - b.hp)
		.map(enemy => enemy.id);
	return enemies;
};

export const getLowest = {
	friends: getLowestFriends,
	enemies: getLowestEnemies,
};

const getSpiritsEnergy = (_spirits: any[]): number => {
	if (!_spirits || _spirits.length === 0) return 0;
	const array = _spirits
		.filter(sp => spirits[sp].hp > 0)
		.map(sp => spirits[sp].energy);
	if (!array || array.length === 0) return 0;
	const _spiritsEnergy = array.reduce((a, b) => a + b, 0);
	return _spiritsEnergy;
};

const getSpiritsEnergyInRange = (
	src: Spirit | Base | Outpost,
	_spirits: any[],
	range = 300,
): number => {
	if (!_spirits || _spirits.length === 0) return 0;
	const array = _spirits
		.filter(sp => spirits[sp].hp > 0)
		.filter(sp => getDistance(src, spirits[sp]) < range)
		.map(sp => spirits[sp].energy);

	if (!array || array.length === 0) return 0;
	const _spiritsEnergy = array.reduce((a, b) => a + b, 0);
	return _spiritsEnergy;
};

export const getEnergy = {
	spirits: getSpiritsEnergy,
	spiritsInRange: getSpiritsEnergyInRange,
};

export const canHarvestMiddle = (): boolean => {
	const enemiesAroundOutpost = outpost.sight.enemies.filter(id =>
		id.startsWith(getPlayerId.enemy),
	);
	const energyAroundOutpost = getSpiritsEnergyInRange(
		outpost,
		enemiesAroundOutpost,
	);

	if (
		outpost.control === getPlayerId.me &&
		energyAroundOutpost === 0 &&
		tick > star_p89.active_at
	) {
		return true;
	}

	return false;
};

export const positionsMatch = (a: Position, b: Position) =>
	Math.round(a[0]) === Math.round(b[0]) &&
	Math.round(a[1]) === Math.round(b[1]);

export const getChainPosition = (
	a: Base,
	b: Star,
	distance: number,
): Position => {
	const xd = a.position[0] - b.position[0];
	const yd = a.position[1] - b.position[1];
	const lineDist = Math.sqrt(xd ** 2 + yd ** 2);
	const proportion = distance / lineDist;
	return [a.position[0] + xd * proportion, a.position[1] + yd * proportion];
};

export const getChainTarget = (spirit: Spirit, role: RoleWorker) => {
	if (spirit.sight.friends.length === 0) return false;
	const potentials = getLowestFriends(spirit)
		.filter(id => spirits[id].role === role)
		.filter(id => spirits[id].energy < spirits[id].energy_capacity);
	if (potentials.length === 0) return false;
	const lowest = potentials[0];
	return lowest;
};
