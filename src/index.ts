/* eslint-disable arrow-body-style */
export * from './camera';
export * from './loader';
export * as timer from './timer';
export * as lines from './lines';
export * as state from './state';

export interface Pos {
	x: number;
	y: number;
}

export interface Vector {
	dx: number;
	dy: number;
}

export type WeightedVector = Vector & {
	w: number;
};

export interface Size {
	w: number;
	h: number;
}

export interface Rect {
	pos: Pos;
	size: Size;
}

export const createRect = (
	x: number,
	y: number,
	w: number,
	h: number
): Rect => {
	return {
		pos: { x, y },
		size: { w, h },
	};
};

export const add = (pos: Pos, v: Vector): Pos => {
	return {
		x: pos.x + v.dx,
		y: pos.y + v.dy,
	};
};

export const dot = (v1: Vector, v2: Vector): number => {
	return v1.dx * v2.dx + v1.dy * v2.dy;
};

export const scale = (v: Vector, s: number): Vector => {
	return {
		dx: v.dx * s,
		dy: v.dy * s,
	};
};

/**
 * Rotate a vector around by radians
 *
 * @param v
 * @param radians
 * @returns {Vector}
 */
export const rotate = (v: Vector, radians: number): Vector => {
	const { dx, dy } = v;
	const cos0 = Math.cos(radians);
	const sin0 = Math.sin(radians);
	return {
		dx: cos0 * dx - sin0 * dy,
		dy: sin0 * dx + cos0 * dy,
	};
};

export const magnitude = (v: Vector): number => {
	return Math.sqrt(v.dx * v.dx + v.dy * v.dy);
};

export const direction = (p1: Pos, p2: Pos): Vector => {
	return {
		dx: p2.x - p1.x,
		dy: p2.y - p1.y,
	};
};

export const cross = (v1: Vector, v2: Vector): number => {
	return v1.dx * v2.dy - v2.dx * v1.dy;
};
