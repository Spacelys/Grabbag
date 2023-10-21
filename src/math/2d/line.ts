import { Pos, Vector } from '..';
import { add, direction, cross, scale, magnitude, rotate } from '.';

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
export const interpolated = (line: Line, distance: number): [Pos, number] => {
	const remainder = Math.max(0, distance - line.len);
	const d = Math.min(Math.max(0, distance), line.len);
	return [add(line.a, scale(line.unit_d, d)), remainder];
};

/**
 * Get position on a line when supplying only the y coordinate.  If y isnt found on the line
 * will return undefined, otherwise if clamp is passed in, it will clamp to the min/max pos of the line
 */
export const getPosWithRespectToY = (
	line: Line,
	y: number,
	clamp?: true
): Pos | undefined => {
	const dy = y - line.a.y;
	const t = dy / line.d.dy;
	if ((t >= 0 && t <= 1) || clamp) {
		return interpolate(line, t);
	}
	return undefined;
};

/**
 * Get position on a line when supplying only the x coordinate.  If x isnt found on the line
 * will return undefined, otherwise if clamp is passed in, it will clamp to the min/max pos of the line
 */
export const getPosWithRespectToX = (
	line: Line,
	x: number,
	clamp?: true
): Pos | undefined => {
	const dx = x - line.a.x;
	const t = dx / line.d.dx;
	if ((t >= 0 && t <= 1) || clamp) {
		return interpolate(line, t);
	}
	return undefined;
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

export const translate = (line: Line, { dx, dy }: Vector): Line => ({
	...line,
	a: { x: line.a.x + dx, y: line.a.y + dy },
	b: { x: line.b.x + dx, y: line.b.y + dy },
});

export const stem = (
	line: Line,
	startD: number,
	radian: number,
	len: number
): Line => {
	const newStart = add(line.a, scale(line.unit_d, startD));
	const v = rotate(line.unit_d, radian);
	const newEnd = add(newStart, scale(v, len));
	return createLine(newStart, newEnd);
};
