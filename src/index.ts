import data from './data';
import controller from './controller/index';
import {stratDefendBase, stratDefendOutpost} from './strategies';

const {friends} = data._spirits;

/**
 * What's more important ?
 * - Protect the base
 * - Kill the enemy
 * - Retreat
 * - Heal
 * - Farm
 */

const main = () => {
	for (const [index, spirit] of my_spirits.entries()) spirit.index = index;

	const moveOrders: Position[] = Array.from({
		length: friends.length,
	}).fill(null) as Position[];

	const energizeOrders: Entity[] = Array.from({
		length: friends.length,
	}).fill(null) as Entity[];

	const busySpirits: number[] = Array.from({
		length: friends.length,
	}).fill(null) as number[];

	const lists = {moveOrders, energizeOrders, busySpirits};

	const {should: shouldDefendBase, attackers: attackersBase} =
		stratDefendBase();
	if (shouldDefendBase && attackersBase) {
		controller.fight(lists, attackersBase, base);
	}

	const {should: shouldDefOupost, attackers: attackersOutpost} =
		stratDefendOutpost();
	if (shouldDefOupost && attackersOutpost) {
		controller.fight(lists, attackersOutpost, outpost);
	}

	for (const [index, spirit] of my_spirits.entries()) {
		if (moveOrders[index]) spirit.move(moveOrders[index]);
		if (energizeOrders[index]) spirit.energize(energizeOrders[index]);
	}
};

main();
