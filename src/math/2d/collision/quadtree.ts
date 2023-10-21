import { Rect } from 'math';
import { createRect } from '..';
import { rectsIntersect, containsRect } from './';

export class QuadTree {
	public boundary: Rect;
	public ne: QuadTree | undefined; // northeast
	public se: QuadTree | undefined; // southeast
	public nw: QuadTree | undefined; // northwest
	public sw: QuadTree | undefined; // southwest
	public nodes: Rect[];
	protected parent: QuadTree | undefined;
	protected capacity: number;

	public constructor(boundary: Rect, parent?: QuadTree) {
		this.parent = parent;
		this.boundary = boundary;
		this.capacity = 4;
		this.nodes = [];
	}

	public contains(node: Rect): boolean {
		return containsRect(this.boundary, node);
	}

	public intersects(node: Rect): boolean {
		return rectsIntersect(this.boundary, node);
	}

	/**
	 * Add a node to a QuadTree, it will return the QuadTree assigned
	 * to the node
	 *
	 * @param node
	 */
	public add(node: Rect): QuadTree {
		const { nodes, capacity } = this;

		if (!this.ne) {
			if (nodes.length > capacity) {
				this.subdivide();
			}
		}

		if (this.ne) {
			// its subdivided
			// todo check size to save some checks against the ne, se... QuadTrees
			const qtrees: QuadTree[] = this.children();
			for (const qtree of qtrees) {
				if (qtree.contains(node)) {
					return qtree.add(node);
				}
			}
		}

		nodes.push(node);
		return this;
	}

	/**
	 * This update function should only be called with a node that exist inside
	 * this particular qTree, it wont work properly otherwise
	 *
	 * @param node
	 */
	public update(node: Rect): QuadTree {
		if (this.contains(node)) {
			for (const qTree of this.children()) {
				if (qTree.contains(node)) {
					this.removeNode(node);
					return qTree.add(node);
				}
			}
			// leave this node alone where it currently is
			return this;
		} else {
			if (this.parent) {
				this.removeNode(node);
				this.parent.add(node);
				// now that the parent contains the node, we can call update on it
				return this.parent.update(node);
			}
			// if there is no parent, there is nothing else we can do to bubble up the node
			// so leave it at this
			// (this should only happen for the main QuadTree where a rect) pokes out its boundaries
			return this;
		}
	}

	protected subdivide(): void {
		const { nodes, boundary } = this;
		const { pos, size } = boundary;
		const halfW = size.w / 2;
		const halfH = size.h / 2;
		const sw = new QuadTree(createRect(pos.x, pos.y, halfW, halfH), this);
		const se = new QuadTree(createRect(pos.x + halfW, pos.y, halfW, halfH), this);
		const nw = new QuadTree(createRect(pos.x, pos.y + halfH, halfW, halfH), this);
		const ne = new QuadTree(
			createRect(pos.x + halfW, pos.y + halfH, halfW, halfH),
			this
		);
		this.se = se;
		this.sw = sw;
		this.ne = ne;
		this.nw = nw;
		const nodesKept: Rect[] = [];
		const distributeNode = (node: Rect) => {
			if (se.contains(node)) {
				se.add(node);
			} else if (ne.contains(node)) {
				ne.add(node);
			} else if (sw.contains(node)) {
				sw.add(node);
			} else if (nw.contains(node)) {
				nw.add(node);
			} else {
				nodesKept.push(node);
			}
		};
		nodes.forEach(distributeNode);
		this.nodes = nodesKept;
	}

	// justs a shorthand to get all the quadTrees in array form
	private children() {
		if (this.ne) {
			return [this.ne, this.se, this.nw, this.sw];
		}
		return [];
	}

	private query(rect: Rect, results: Rect[] = []) {
		if (!this.intersects(rect)) {
			return [];
		}

		if (this.ne) {
			const qtrees: QuadTree[] = [
				this.ne,
				this.se,
				this.nw,
				this.sw,
			];
			for (const qtree of qtrees) {
				if (qtree.intersects(rect)) {
					results = [...qtree.query(rect, results)];
				}
			}
		}

		this.nodes.forEach((node) => {
			// we want to be sure we check for intersections that are not against our original rect
			if (rectsIntersect(node, rect) && node !== rect) {
				results.push(node);
			}
		});
		return results;

		return [];
	}



	private removeNode(node: Rect) {
		this.nodes = this.nodes.filter((n) => n !== node);
	}

	private hasNode(node: Rect) {
		return !!this.nodes.find((n) => n === node);
	}
}
