import { Rect } from '../';

export interface AnimationSequence {
	frameId: number;
	duration: number;
}
export type Frame = Rect;

export interface AnimationInstance {
	parentId: symbol;
	sequenceTime: number;
	sequenceIndex: number;
	frameIndex: number;
	factor: number;
	onFinish?: (remainderMs: number) => void;
	onLooped?: (remainderMs: number) => void;
	onFinishCalled: boolean;
}

export interface AnimationDefinition {
	id: symbol;
	frames: Frame[];
	sequence?: AnimationSequence[];
	looped?: boolean;
	totalTime: number;
}

export const instance = (def: AnimationDefinition): AnimationInstance => ({
	parentId: def.id,
	sequenceTime: 0,
	sequenceIndex: 0,
	frameIndex: 0,
	factor: 1,
	onFinishCalled: false,
});

export const update = (def: AnimationDefinition, inst: AnimationInstance, dt: number): AnimationInstance => {
	if (def.id !== inst.parentId) {
		throw Error('Instance not child of parent definition');
	}

	const ret: AnimationInstance = {...inst};

	ret.sequenceTime = inst.sequenceTime + dt * inst.factor;
	if (ret.sequenceTime >= def.totalTime) {
		const remainder = ret.sequenceTime - def.totalTime;
		if (def.looped) {
			if (inst.onLooped) {
				inst.onLooped(remainder);
			}
			ret.sequenceTime = ret.sequenceTime % def.totalTime;
		} else {
			if (inst.onFinish && !inst.onFinishCalled) {
				inst.onFinish(remainder);
				ret.onFinishCalled = true;
			}
		}
	}

	let cursor = 0;
	for (let i = 0; i < def.sequence.length; i++) {
		const s = def.sequence[i];
		if (inst.sequenceTime < cursor + s.duration) {
			ret.frameIndex = s.frameId;
			ret.sequenceIndex = i;
			break;
		}
		cursor += s.duration;
	}
	return ret;
};

export const getFrame = (def: AnimationDefinition, inst: AnimationInstance): Frame => {
	// only one frame so you are always going to get the same one
	if (def.frames.length === 1) {
		return def.frames[0];
	}
	if (!def.sequence) {
		return def.frames[0];
	}

	return def.frames[inst.frameIndex];
};

/**
 * An animation can be defined by just one Frame
 *
 * @param frames
 * @param sequence
 * @param loop
 */
export const create = (
	frames: Frame[], sequence?: AnimationSequence[], looped?: boolean
): AnimationDefinition => {
	let totalTime = 0;
	if (sequence) {
		sequence.forEach(s => {
			totalTime += s.duration;
		});
	}
	return {
		id: Symbol(),
		frames,
		sequence,
		looped,
		totalTime,
	};
};

// @todo deprecate
export class Animation {
	private frames: Frame[];
	private sequence: AnimationSequence[];
	private looped: boolean;
	private sequenceTime: number;
	private sequenceIndex: number;
	private totalTime: number;
	private onFinishedCalled: boolean;
	private onFinish?: () => void;
	private frameIndex: number;
	private factor: number;

	/**
	 * Creates an instance of Animation.
	 *
	 * @memberof Animation
	 */
	public constructor({
		frames, sequence, looped, onFinish, scale = 1,
	}: { frames: Frame[]; sequence: AnimationSequence[]; looped: boolean; onFinish?: () => void; scale?: number }) {
		this.frames = frames;
		this.sequence = sequence;
		this.looped = typeof looped !== 'undefined' ? looped : true;
		this.sequenceTime = 0;
		this.totalTime = 0;
		this.frameIndex = 0;
		this.sequenceIndex = 0;
		this.onFinish = onFinish;
		this.onFinishedCalled = false;

		// single frames dont need sequence property
		if (sequence) {
			sequence.forEach(s => {
				this.totalTime += s.duration;
			});
		}
		this.factor = scale;
	}

	public duration(): number {
		return this.totalTime / this.factor;
	}
	/**
	 * Automatically advance to the next frame in the animation
	 *
	 * @memberof Animation
	 */
	public nextFrame(): void {
		const { sequence, looped } = this;
		this.sequenceIndex += 1;
		if (this.sequenceIndex >= sequence.length) {
			if (looped) {
				this.sequenceIndex = this.sequenceIndex % sequence.length;
			} else {
				// we've reached the end of the sequence we can't actually go further
				this.sequenceIndex = sequence.length - 1;
			}
		}

		let sequenceStartTime = 0;
		for (let i = 0; i < this.sequenceIndex; i++) {
			const s = sequence[i];
			sequenceStartTime += s.duration;
		}

		this.sequenceTime = sequenceStartTime;
		this.frameIndex = sequence[this.sequenceIndex].frameId;
	}


	/**
	 * scale the rate that the animation is played from its originally defined sequence
	 *
	 * @param {number} factor
	 * @memberof Animation
	 */
	public scale(factor: number): void {
		this.factor = factor;
	}

	public reset(): void {
		this.sequenceTime = 0;
	}

	/**
	 * advance the frame of an animation by the time input
	 *
	 * @param {number} dt time to advance animation by (in milliseconds)
	 * @returns Frame
	 * @memberof Animation
	 */
	public update(dt: number): Frame {
		if (this.frames.length === 1) {
			return this.frames[0];
		}
		this.sequenceTime += dt * this.factor;
		if (this.sequenceTime >= this.totalTime) {
			if (this.looped) {
				this.sequenceTime = this.sequenceTime % this.totalTime;
			} else {
				if (this.onFinish && !this.onFinishedCalled) {
					this.onFinish();
					this.onFinishedCalled = true;
				}
			}
		}

		const { sequence } = this;
		let counter = 0;

		for (let i = 0; i < sequence.length; i++) {
			const s = sequence[i];
			if (this.sequenceTime < counter + s.duration) {
				this.frameIndex = s.frameId;
				this.sequenceIndex = i;
				break;
			}
			counter += s.duration;
		}

		return this.frames[this.frameIndex];
	}
}
