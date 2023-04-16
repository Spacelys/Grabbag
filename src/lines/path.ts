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

// export class Path {
// 	lines: Line[];
// 	len: number;

// 	constructor(points?: Pos[], lines?: Line[], len?: number) {
// 		if (points) {
// 			this.lines = [];
// 			this.len = 0;
// 			if (points.length < 2) {
// 				throw "You can't make a path with less than 2 points";
// 			}
// 			for (let i = 0; i < points.length - 1; i++) {
// 				const pi = points[i];
// 				const pi_plus1 = points[i + 1];
// 				const line = new Line(pi, pi_plus1);
// 				this.len += line.len;
// 				this.lines.push(line);
// 			}
// 		} else {
// 			if (lines && len) {
// 				if (lines.length === 0 || len === 0) {
// 					throw "You can't make a path with the supplied len and lines";
// 				}
// 				this.lines = lines;
// 				this.len = len;
// 			} else {
// 				throw 'You cant make a path';
// 			}
// 		}
// 	}

// 	translate(dx: number, dy: number): Path {
// 		const newLines = this.lines.map((line) => {
// 			return line.translate(dx, dy);
// 		});

// 		return new Path(undefined, newLines, this.len);
// 	}

// 	intersection(myLine: Line): { pos: Pos; d: number } | undefined {
// 		let runningD = 0;
// 		for (let line of this.lines) {
// 			const inter = line.intersection(myLine);

// 			if (inter) {
// 				const deltaD = line.getDfromPosition(inter);
// 				return {
// 					pos: inter,
// 					d: runningD + deltaD
// 				};
// 			}
// 			runningD += line.len;
// 		}
// 		return undefined;
// 	}

// 	interpolated(distance: number): [Pos | undefined, number, number] {
// 		const remainder = Math.max(0, distance - this.len);
// 		const d = Math.min(Math.max(0, distance), this.len);
// 		// brute force way to see which line we are on
// 		let running_d = 0;
// 		let myLine: Line | undefined = undefined;
// 		for (let i = 0; i < this.lines.length; i++) {
// 			const line = this.lines[i];
// 			if (i === this.lines.length - 1) {
// 				// by default return last line
// 				myLine = line;
// 				break;
// 			}
// 			if (d - running_d < line.len) {
// 				// we are on this line
// 				myLine = line;
// 				break;
// 			}
// 			running_d += line.len;
// 		}
// 		return [myLine?.interpolated(d - running_d)[0], d, remainder];
// 	}
// }
