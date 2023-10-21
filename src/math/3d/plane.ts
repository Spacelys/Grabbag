import { Plane, III } from '../';

export const getY = (plane: Plane, x: number, z: number): number => {
	// nx*x + ny*y + nz*z + d = 0
	// ny*y = -nx*x - nz*z - d;
	// y = (-nx*x - nz*z - d)/ny
	const y = (-III.dot(plane.n, { dx: x, dy: 0, dz: z }) - plane.d) / plane.n.dy;
	return y;
};
