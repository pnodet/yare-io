import {getClosest, canHarvestMiddle} from '../utils/functions';

const getRoleCount = (role: RoleWorker): number =>
	Object.values(my_spirits).filter(s => s.role === role).length;

const workerCount: Record<string, number> = {
	harvester: getRoleCount('harvester'),
	linker: getRoleCount('linker'),
	feeder: getRoleCount('feeder'),
};

const getRole = (): RoleWorker => {
	const sumOfRoles = [
		workerCount.harvester / 2,
		workerCount.feeder,
		workerCount.linker,
	];
	const possiblePositions: RoleWorker[] = ['harvester', 'feeder', 'linker'];
	const role = possiblePositions[sumOfRoles.indexOf(Math.min(...sumOfRoles))];
	workerCount[role]++;
	return role;
};

const starEnergyGain = (starEnergy: number): number =>
	Math.round(2 + 0.02 * starEnergy);

const maxStarFarmers = (star: Star, shipSize: number): number =>
	Math.floor(starEnergyGain(star.energy_capacity) / (0.5 * shipSize));

const shouldHarvestMiddle = (): boolean => {
	const harvesters = Object.values(my_spirits).filter(s => s.type === 'worker');
	return canHarvestMiddle();
};

const shouldWorkerHeal = (spirit: Spirit): boolean => {
	const friendsAround = getClosest.friends(spirit);
	const needHeal = friendsAround.filter(
		(id: SpiritID) =>
			spirits[id].type === 'soldier' &&
			spirits[id].energy < spirits[id].energy_capacity,
	);

	if (needHeal.length > 0) return true;
	return false;
};

/*
{
  return false;
  const harvesters = (my_spirits as any[]).filter(s => s.type === 'worker');
  // Every tick (1 tick = 600ms), a star generates 2 energy + 2% of its current energy (rounded to a nearest integer)
  const starGain = Math.round(2 + 0.02 * MY_STAR.energy);
  // return count.worker > maxStarFarmers(MY_STAR) && canHarvestMiddle();
};
*/

export {getRole, shouldWorkerHeal, shouldHarvestMiddle};
