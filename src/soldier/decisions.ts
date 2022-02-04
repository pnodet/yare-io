import {getEnergy, getPlayerId} from '../utils/functions';
import {notFull, isEmpty} from '../utils/state';

// ************ SOLDIERS ********************

/**
 * @function shouldScout
 * If role is scout
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldScout = (spirit: Spirit): boolean => {
	if (spirit.role === 'scout' && spirit.energy > 3) return true;
	return false;
};

/**
 * @function shouldAttackBase
 * If we have more troops
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldAttackBase = (): boolean => {
	const enemiesAroundBase = enemy_base.sight.friends.filter(id =>
		id.startsWith(getPlayerId.enemy),
	);
	const energyAroundBase = getEnergy.spiritsInRange(
		enemy_base,
		enemiesAroundBase,
	);

	const allAttackers = my_spirits
		.map(s => ({id: s.id, energy: s.energy, type: s.type}))
		.filter(s => s.type === 'soldier')
		.filter(s => s.energy > 3);
	const allAttackersId = allAttackers.map(s => s.id);
	const allEnergyAttackers = getEnergy.spirits(allAttackersId);

	if (allEnergyAttackers > energyAroundBase * 1.5) return true;

	return false;
};

/**
 * @function shouldRecharge
 * If the spirit is not full and no enemies in sight
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldRecharge = (spirit: Spirit): boolean =>
	(spirit.sight.enemies.length === 0 && notFull(spirit)) || isEmpty(spirit);

/**
 * @function shouldCaptureOutpost
 * If its free and undefended
 * Or if we have more troops
 * @param {Spirit} spirit Current spirit
 * @returns {boolean}
 */
export const shouldCaptureOutpost = (): boolean => {
	const enemiesAroundOutpost = outpost.sight.enemies.filter(id =>
		id.startsWith(getPlayerId.enemy),
	);
	const energyAroundOutpost = getEnergy.spiritsInRange(
		outpost,
		enemiesAroundOutpost,
	);

	const attackers = my_spirits
		.map(s => ({id: s.id, energy: s.energy, role: s.role}))
		.filter(s => s.role === 'attacker')
		.filter(s => s.energy > 3);
	const attackersId = attackers.map(s => s.id);
	const energyAttackers = getEnergy.spirits(attackersId);

	if (
		(outpost.control === getPlayerId.me || energyAroundOutpost === 0) &&
		notFull(outpost)
	)
		return true;

	if (
		outpost.control === getPlayerId.enemy &&
		energyAttackers > energyAroundOutpost * 1.5 + outpost.energy
	)
		return true;

	return false;
};
