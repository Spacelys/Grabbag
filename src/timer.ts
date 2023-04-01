const getSeconds = () => new Date().getTime() / 1000;

export interface Timer {
	startTime: number;
	refTime: number;
}

export const createTimer = (): Timer => {
	const timeNow = getSeconds();
	return {
		startTime: timeNow,
		refTime: timeNow,
	};
};

export const lap = (timer: Timer): number => {
	const timeNow = getSeconds();
	const delta = timeNow - timer.refTime;
	timer.refTime = timeNow;
	return delta;
};

export const totalTime = (timer: Timer): number => {
	const timeNow = getSeconds();
	return timeNow - timer.startTime;
};
