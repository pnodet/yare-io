const getDistance = (p1: Position, p2: Position): number => {
	const dx = (p1[0] - p2[0]) ** 2;
	const dy = (p1[1] - p2[1]) ** 2;
	return Math.sqrt(dx + dy);
};

const _players = {
	me: this_player_id,
	enemy: players.p1 === this_player_id ? players.p2 : players.p1,
};

const getSpiritsFriends = () => {
	const allSpirits = Array.from(Object.values(spirits)) as Spirit[];
	const friends = allSpirits.filter(
		sp => sp.id.startsWith(_players.me) && sp.hp > 0,
	);
	return friends;
};

const getSpiritsEnemies = () => {
	const allSpirits = Array.from(Object.values(spirits)) as Spirit[];
	const enemies = allSpirits.filter(
		sp => sp.id.startsWith(_players.enemy) && sp.hp > 0,
	);
	return enemies;
};

const _spirits = {
	friends: getSpiritsFriends(),
	enemies: getSpiritsEnemies(),
};

const _bases = {
	me: base,
	enemy: enemy_base,
};

const getStars = () => {
	const distanceBaseZxq = getDistance(base.position, star_zxq.position);
	const distanceBaseA1c = getDistance(base.position, star_a1c.position);

	const stars = {
		me: star_zxq,
		middle: star_p89,
		enemy: star_a1c,
	};

	if (distanceBaseA1c < distanceBaseZxq) {
		stars.me = star_a1c;
		stars.enemy = star_zxq;
	}

	return stars;
};

const getOupostStatus = (): {
	me: boolean;
	enemy: boolean;
} => {
	const me = _players.me === outpost.control;
	const enemy = _players.enemy === outpost.control;
	return {me, enemy};
};

const retrieveData = () => {
	const _stars = getStars();
	const _outpostStatus = getOupostStatus();
	return {_players, _spirits, _bases, _stars, _outpostStatus};
};

const data = retrieveData();
export default data;
