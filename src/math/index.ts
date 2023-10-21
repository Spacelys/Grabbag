export * as II from './2d';
export * as III from './3d';

export interface Pos {
	x: number;
	y: number;
}

export const Pos = (x: number, y: number): Pos => ({
	x,
	y,
});

export interface Pos3 extends Pos {
	z: number;
}

export const Pos3 = (x: number, y: number, z: number): Pos3 => ({
	x,
	y,
	z,
});

export interface Vector {
	dx: number;
	dy: number;
}

export const Vector = (dx: number, dy: number): Vector => ({
	dx,
	dy,
});

export interface Vector3 extends Vector {
	dz: number;
}

export const Vector3 = (dx: number, dy: number, dz: number): Vector3 => ({
	dx,
	dy,
	dz,
});

export type WeightedVector = Vector & {
	w: number;
};

export type WeightedVector3 = Vector3 & {
	w: number;
};

export interface Size {
	w: number;
	h: number;
}

export const Size = (w: number, h: number): Size => ({
	w,
	h,
});

export interface Size3 extends Size {
	l: number;
}

export const Size3 = (w: number, h: number, l: number): Size3 => ({
	w,
	h,
	l,
});

export interface Rect {
	pos: Pos;
	size: Size;
}

export interface Bound {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
}

export interface Rect3 {
	pos: Pos3;
	size: Size3;
}

export interface Plane {
	n: Vector3;
	d: number;
}

export const Plane = (normal: Vector3, d: number): Plane => ({ n: normal, d });
