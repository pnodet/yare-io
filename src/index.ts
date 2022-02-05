import getMoveOrders from '@/move/index';
import getEnergizeOrders from '@/energize/index';
import dashboard from '@/dashboard';

const main = () => {
	for (const [index, spirit] of my_spirits.entries()) spirit.index = index;

	const [targetPosition, nfarmers, nmidfarmers] = getMoveOrders();
	const targetEnergy: Entity[] = getEnergizeOrders(nfarmers, nmidfarmers);

	for (const [index, spirit] of my_spirits.entries()) {
		if (targetPosition[index]) spirit.move(targetPosition[index]);
		if (targetEnergy[index]) spirit.energize(targetEnergy[index]);
	}
};

main();

console.log(`ticks: ${tick}`);
console.log(`totalEnergy:  ${dashboard.totalEnergy}`);
console.log(`movingAverage:  ${dashboard.movingAverage}`);
console.log(`totalEnergyOp:  ${dashboard.totalEnergyOp}`);
console.log(`movingAverageOp:  ${dashboard.movingAverageOp}`);
