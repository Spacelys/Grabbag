/* eslint-disable arrow-body-style */
export * from './camera';
export * from './loader';
export * as timer from './timer';

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
