import { Pos, Vector } from '../';
import { Line, createLine, translate as translateLine } from './line';

export interface Path {
	lines: Line[];
	len: number;
}

export const creatPath = (points: Pos[]): Path => {
	const lines = [];
	let len = 0;
	if (points.length < 2) {
		throw Error("You can't make a path with less than 2 points");
	}
	for (let i = 0; i < points.length - 1; i++) {
		const pi = points[i];
		const pi_plus1 = points[i + 1];
		const line = createLine(pi, pi_plus1);
		len += line.len;
		lines.push(line);
	}
	return {
		lines,
		len,
	};
};

export const translate = (path: Path, delta: Vector): Path => ({
	...path,
	lines: path.lines.map(l => translateLine(l, delta)),
});
