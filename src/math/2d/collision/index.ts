import { Rect } from 'math';
import { rectBounds } from '..';
export { QuadTree } from './quadtree';

/**
 * Returns true if the bigRect completely contains the small Rect
 *
 * @param bigRect
 * @param smallRect
 */
export const containsRect = (bigRect: Rect, smallRect: Rect): boolean => {
	const A = rectBounds(bigRect);
	const B = rectBounds(smallRect);

	return B.x1 >= A.x1 && B.x2 <= A.x2 && B.y1 >= A.y1 && B.y2 <= A.y2;
};

/**
 * Returns true if the rects supplied intersect
 *
 * @param rectA
 * @param rectB
 */
export const rectsIntersect = (rectA: Rect, rectB: Rect): boolean => {
	const A = rectBounds(rectA);
	const B = rectBounds(rectB);

	return A.x1 <= B.x2 && B.x1 <= A.x2 && A.y1 <= B.y2 && B.y1 <= A.y2;
};
