import { Pos, Vector, WeightedVector } from '..';

export interface Area {
	focus: Pos;
	fill: Vector[];
}

export interface WeightedArea {
	focus: Pos;
	fill: WeightedVector[];
}
