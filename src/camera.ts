import { Pos, Size, Rect, createRect, Vector } from './';

export interface Camera {
	fieldOfView: Rect;
	bounds: Rect;
	focus: Pos;
}

export const getCamera = (
	focus: Pos,
	viewSize: Size,
	cameraBounds: Rect
): Camera => {
	const size = viewSize;
	const worldPos = cameraBounds.pos;
	const worldSize = cameraBounds.size;

	const x = Math.min(
		Math.max(worldPos.x, focus.x - size.w / 2),
		worldPos.x + worldSize.w - size.w
	);
	const y = Math.min(
		Math.max(worldPos.y, focus.y - size.h / 2),
		worldPos.y + worldSize.h - size.h
	);

	return {
		fieldOfView: createRect(x, y, size.w, size.h),
		bounds: cameraBounds,
		focus,
	} as Camera;
};

export const shiftCamera = (cam: Camera, delta: Vector): Camera => {
	const minPos = {
		x: cam.bounds.pos.x + cam.fieldOfView.size.w / 2,
		y: cam.bounds.pos.y + cam.fieldOfView.size.h / 2,
	};
	const maxPos = {
		x: cam.bounds.pos.x + cam.bounds.size.w - cam.fieldOfView.size.w / 2,
		y: cam.bounds.pos.y + cam.bounds.size.h - cam.fieldOfView.size.h / 2,
	};

	const desiredNewFocus = {
		x: cam.focus.x + delta.dx,
		y: cam.focus.y + delta.dy,
	};
	const newFocus = {
		x: Math.min(Math.max(desiredNewFocus.x, minPos.x), maxPos.x),
		y: Math.min(Math.max(desiredNewFocus.y, minPos.y), maxPos.y),
	};
	return getCamera(newFocus, cam.fieldOfView.size, cam.bounds);
};
