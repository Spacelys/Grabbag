import { Pos, add, Vector, direction, cross, scale, magnitude, rotate } from '../.';

export interface Line {
	a: Pos;
	b: Pos;
	len: number;
	d: Vector;
	unit_d: Vector;
}

export const createLine = (a: Pos, b: Pos): Line => {
	const d = direction(a, b);
	const len = magnitude(d);
	return {
		a,
		b,
		d,
		len,
		unit_d: scale(d, 1 / len),
	};
};

export const lineIntersection = (line1: Line, line2: Line): Pos | undefined => {
	const l1xl2 = cross(line1.d, line2.d);

	if (l1xl2 === 0) {
		return undefined;
	} else {
		const l1a2a = direction(line1.a, line2.a);
		const t1 = cross(l1a2a, line2.d) / l1xl2;
		const t2 = -cross(line1.d, l1a2a) / l1xl2;
		if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
			return add(line1.a, scale(line1.d, t1));
		}
	}
	return undefined;
};

// maxed out at [0, 1]
export const interpolate = (line: Line, t: number): Pos => {
	const val = Math.min(Math.max(0, t), 1);
	return add(line.a, scale(line.d, val));
};

// maxed out at [0, len]
export const interpolated = (line: Line, distance: number): [Pos, number, number] => {
	const remainder = Math.max(0, distance - line.len);
	const d = Math.min(Math.max(0, distance), line.len);
	return [
		add(line.a, scale(line.unit_d, d)
		),
		d,
		remainder,
	];
};


export const rotateLine = (line: Line, radians: number): Line => {
	const new_unit_d: Vector = rotate(line.unit_d, radians);
	const d = scale(new_unit_d, line.len);

	return {
		a: line.a,
		b: add(line.a, d),
		d,
		len: line.len,
		unit_d: new_unit_d,
	};
};

/**
 * This method is meant to be used when the position can be found on the line.  It will return
 * a scalar that represents the distance from the start of the line to that point.
 *
 * @param {Line} line - Line to use to determine distance
 * @param {Pos} pos -  A pos or point located on the line provided
 * @returns {number} distance of point from teh start of the supplied line
 */
export const getDfromPosition = (line: Line, pos: Pos): number => {
	const dVector = direction(line.a, pos);
	return magnitude(dVector);
};

export const translate = (line: Line, {dx, dy}: Vector): Line => ({
	...line,
	a: { x: line.a.x + dx, y: line.a.y + dy },
	b: { x: line.b.x + dx, y: line.b.y + dy },
});

// export class Line {
// 	a: Pos;
// 	b: Pos;
// 	len: number;
// 	d: Vector;
// 	unit_d: Vector;

// 	constructor(a: Pos, b: Pos, d?: Vector, len?: number, unit_d?: Vector) {
// 		this.a = a;
// 		this.b = b;
// 		this.d = d || distance(a, b);
// 		this.len = len || magnitude(this.d);
// 		this.unit_d = unit_d || scale(this.d, 1 / magnitude(this.d));
// 	}

// 	translate(dx: number, dy: number) {
// 		const a = add(this.a, { x: dx, y: dy });
// 		const b = add(this.b, { x: dx, y: dy });

// 		return new Line(a, b, this.d, this.len, this.unit_d);
// 	}
// 	// maxed out at [0, 1]
// 	interpolate(t: number): Pos {
// 		const val = Math.min(Math.max(0, t), 1);
// 		return add(this.a, scale(this.d, val));
// 	}

// 	interpolated(distance: number): [Pos, number, number] {
// 		const remainder = Math.max(0, distance - this.len);
// 		const d = Math.min(Math.max(0, distance), this.len);
// 		return [add(this.a, scale(this.unit_d, d)), d, remainder];
// 	}

// 	getDfromPosition(pos: Pos) {
// 		const dVector = distance(this.a, pos);
// 		return magnitude(dVector);
// 	}

// 	intersection(line: Line): Pos | undefined {
// 		const l1xl2 = cross(this.d, line.d);

// 		if (l1xl2 === 0) {
// 			return undefined;
// 		} else {
// 			// else:
// 			// ac = c - a
// 			// t1 = ac.cross(cd) / ab_cross_cd
// 			// t2 = -ab.cross(ac) / ab_cross_cd
// 			// return a + ab.scaled(t1), t1, t2
// 			const l1a2a = distance(this.a, line.a);
// 			const t1 = cross(l1a2a, line.d) / l1xl2;
// 			const t2 = -cross(this.d, l1a2a) / l1xl2;
// 			if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
// 				return add(this.a, scale(this.d, t1));
// 			}
// 		}
// 		return undefined;
// 	}
// }
