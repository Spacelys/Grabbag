import * as grabbag from "../src";

/// Code for Line examples
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

const line1 = grabbag.lines.line.createLine({x: 0, y: 0}, {x: 100, y: 100});
const line2 = grabbag.lines.line.createLine({x: 0, y: 50}, {x: 100, y: 50});
const line3 = grabbag.lines.line.createLine({x: 150, y: 0}, {x: 150, y: 50}); // no intersect
const intersection = grabbag.lines.line.lineIntersection(line1, line2);

drawLine("lines", line1);
drawLine("lines", line2);
drawLine("lines", line3);
drawPoint("lines", intersection);

console.log('Should be intersected', grabbag.lines.line.lineIntersection(line1, line2));

/// Code for path examples
const drawPath = (canvasId: string, path: grabbag.lines.path.Path) => {
	path.lines.forEach(l => {
		drawLine(canvasId, l);
	});
};

const path1 = grabbag.lines.path.creatPath([{x: 10, y: 10}, {x: 50, y: 5}, {x: 100, y: 30}, {x: 200, y: 15}]);

drawPath("path", path1);
