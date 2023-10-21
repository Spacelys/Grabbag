/* eslint-disable arrow-body-style */
import { Rect3, Pos3, Vector3 } from '..';
export * as Plane from './plane';
export * as Line from './line';

export const createRect = (
	x: number,
	y: number,
	z: number,
	w: number,
	h: number,
	l: number
): Rect3 => {
	return {
		pos: { x, y, z },
		size: { w, h, l },
	};
};

export const add = (pos: Pos3, v: Vector3): Pos3 => {
	return {
		x: pos.x + v.dx,
		y: pos.y + v.dy,
		z: pos.z + v.dz,
	};
};

export const delta = (a: Pos3, b: Pos3): Vector3 => {
	return {
		dx: b.x - a.x,
		dy: b.y - a.y,
		dz: b.z - a.z,
	};
};

export const dot = (v1: Vector3, v2: Vector3): number => {
	return v1.dx * v2.dx + v1.dy * v2.dy + v1.dz * v2.dz;
};

export const scale = (v: Vector3, s: number): Vector3 => {
	return {
		dx: v.dx * s,
		dy: v.dy * s,
		dz: v.dz * s,
	};
};

export const magnitude = (v: Vector3): number => {
	return Math.sqrt(v.dx * v.dx + v.dy * v.dy + v.dz * v.dz);
};

export const direction = (p1: Pos3, p2: Pos3): Vector3 => {
	return {
		dx: p2.x - p1.x,
		dy: p2.y - p1.y,
		dz: p2.z - p1.z,
	};
};

export const cross = (v1: Vector3, v2: Vector3): Vector3 => {
	return {
		dx: v1.dy * v2.dz - v1.dz * v2.dy,
		dy: v1.dz * v2.dx - v1.dx * v2.dz,
		dz: v1.dx * v2.dy - v1.dy * v2.dx,
	};
};

export const normalize = (v: Vector3): Vector3 => {
	const { dx, dy, dz } = v;
	const mag = magnitude(v);
	return {
		dx: dx / mag,
		dy: dy / mag,
		dz: dz / mag,
	};
};

export const average = (vs: Vector3[]): Vector3 => {
	const n = vs.length;
	const sum = vs.reduce(
		(acc, v) => {
			return {
				dx: acc.dx + v.dx,
				dy: acc.dy + v.dy,
				dz: acc.dz + v.dz,
			};
		},
		{ dx: 0, dy: 0, dz: 0 }
	);
	return {
		dx: sum.dx / n,
		dy: sum.dy / n,
		dz: sum.dz / n,
	};
};
