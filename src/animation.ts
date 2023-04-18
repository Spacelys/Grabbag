import { Rect } from './index';

export interface AnimationFrame {
	frame: number;
	duration: number;
}
export type Frame = Rect;

export class Animation {
	private frames: Frame[];
	private sequence: AnimationFrame[];
	private looped: boolean;
	private sequenceTime: number;
	private sequenceIndex: number;
	private totalTime: number;
	private onFinishedCalled: boolean;
	private onFinish: () => void;
	private frameIndex: number;
	private factor: number;

	/**
	 * Creates an instance of Animation.
	 *
	 * @memberof Animation
	 */
	public constructor({
		frames, sequence, looped, onFinish, scale = 1,
	}: { frames: Frame[]; sequence: AnimationFrame[]; looped: boolean; onFinish: () => void; scale?: number }) {
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
		this.frameIndex = sequence[this.sequenceIndex].frame;
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
				this.frameIndex = s.frame;
				this.sequenceIndex = i;
				break;
			}
			counter += s.duration;
		}

		return this.frames[this.frameIndex];
	}
}
