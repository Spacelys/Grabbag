import * as grabbag from "../../src";

/// Code for Line examples
const clearCanvas = (canvasId: string) => {
	const c = document.getElementById(canvasId) as HTMLCanvasElement;
	const ctx = c.getContext("2d");
	ctx?.clearRect(0, 0, c.width, c.height);
}

const drawLine = (canvasId: string, line: grabbag.lines.line.Line) => {
	const c = document.getElementById(canvasId) as HTMLCanvasElement;
	const ctx = c.getContext("2d");
	if (c && ctx) {
		ctx.beginPath();
		ctx.moveTo(line.a.x, line.a.y);
		ctx.lineTo(line.b.x, line.b.y);
		ctx.stroke();
	}
};

const drawPoint = (canvasId: string, point?: grabbag.Pos) => {
	const c = document.getElementById(canvasId) as HTMLCanvasElement;
	const ctx = c.getContext("2d");
	if (c && ctx && point) {
		ctx.beginPath();
		ctx.fillStyle = 'red';
		ctx.rect(point.x-3, point.y-3, 6, 6);
		ctx.fill();
	}
};

const lineExample = () => {
	const line1 = grabbag.lines.line.createLine({x: 0, y: 0}, {x: 100, y: 100});
	const line2 = grabbag.lines.line.createLine({x: 0, y: 50}, {x: 100, y: 50});
	const line3 = grabbag.lines.line.createLine({x: 150, y: 0}, {x: 150, y: 50}); // no intersect
	const intersection = grabbag.lines.line.lineIntersection(line1, line2);

	drawLine("lines", line1);
	drawLine("lines", line2);
	drawLine("lines", line3);
	drawPoint("lines", intersection);

	console.log('Should be intersected', grabbag.lines.line.lineIntersection(line1, line2));
}
/// Code for path examples

const pathExample = () => {
	const drawPath = (canvasId: string, path: grabbag.lines.path.Path) => {
		path.lines.forEach(l => {
			drawLine(canvasId, l);
		});
	};
	
	const path1 = grabbag.lines.path.creatPath([{x: 10, y: 10}, {x: 50, y: 5}, {x: 100, y: 30}, {x: 200, y: 15}]);
	
	drawPath("path", path1);
}

const animationExample = () => {
	// grabbag.animation.
	const frames: grabbag.animation.Frame[] = [
		{ pos: {x: 10, y: 10}, size: {w: 20, h: 0} },
		{ pos: {x: 5, y: 0}, size: {w: 15, h: 5} },
		{ pos: {x: 5, y: 5}, size: {w: 10, h: 10} },
		{ pos: {x: 0, y: 5}, size: {w: 5, h: 15} },
	]

	const sequence: grabbag.animation.AnimationSequence[] = [
		{ frameId: 0, duration: 500 },
		{ frameId: 1, duration: 500 },
		{ frameId: 2, duration: 500 },
		{ frameId: 3, duration: 500 },
	];

	const def = grabbag.animation.create(frames, sequence, true);
	let anim = grabbag.animation.instance(def);
	anim.onFinish = (r) => { console.log('I finished', r); }
	anim.onLooped = (r) => { console.log('I looped', r); }

	let refTime = performance.now();
	let dt = 0;
	const renderFrame = () => {
		const frame = grabbag.animation.getFrame(def, anim);
		clearCanvas("animation");
		const lineToFrame = grabbag.lines.line.createLine({
			x: frame.pos.x,
			y: frame.pos.y
		}, {
			x: frame.pos.x + frame.size.w,
			y: frame.pos.y + frame.size.h
		});
		drawLine("animation", lineToFrame);
		requestAnimationFrame(() => {
			const nowTime = performance.now();
			dt = nowTime - refTime;
			refTime = nowTime;
			try {
				anim = grabbag.animation.update(def, anim, dt);
				renderFrame();
			} catch (err) {
				console.log(err);
			}
		})
	}
	renderFrame()
};

lineExample();
pathExample();
animationExample();
