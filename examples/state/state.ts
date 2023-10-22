import * as state from './../../src/state';
console.clear();

type translate = { type: 'translate', payload: { dx: number, dy: number } };
type move = { type: 'move', payload: { x: number, y: number } };
const positional = state.create<{ pos: { x: number, y: number } }, translate | move>({
	reducer: (s, a) => {
		if (a.type === "move") {
			return { pos: {x: a.payload.x, y: a.payload.y } }
		}
		if (a.type === "translate") {
			return { pos: {x: s.pos.x + a.payload.dx, y: s.pos.y + a.payload.dy } }
		}
		return {
			pos: {
				x: s.pos.x,
				y: s.pos.y
			}
		};
	},
}).withActions({
	move: (x: number, y: number): move => ({
		type: 'move',
		payload: { x, y }
	}),
	translate: (dx: number, dy: number): translate => ({
		type: 'translate',
		payload: { dx, dy }
	})
});

type hurt = { type: 'hurt', payload: number };
type heal = { type: 'heal', payload: number };
const hitable = state.create<{ hp: number }, hurt | heal>({
	reducer: (s, a) => {
		if (a.type === "hurt") {
			return { hp: s.hp - a.payload }
		}
		if (a.type === "heal") {
			return { hp: s.hp - a.payload }
		}
		return {
			hp: s.hp
		};
	},
}).withActions({
	hurt: (val: number): hurt => ({
		type: 'hurt',
		payload: val
	}),
	heal: (val: number): heal => ({
		type: 'heal',
		payload: val
	}),
});

type toggle = { type: 'toggle', payload: number };
const blockable = state.create<{ block: true }, toggle>({
	reducer: (s, a) => {
		return {
			block: true
		};
	},
}).withActions({});

console.log('***** combine op *******');

const character = state.combine(blockable, state.combine(hitable, positional));
const villain = state.combine(
	character,
	state.embed(character, (s) => ({ minion1: s}), (w) => w.minion1)
);

const Vi = villain.instance({
	block: true,
	hp: 20,
	pos: {x: 0, y: 0},
	minion1: {
		hp: 20,
		pos: { x: 0, y: 10},
		block: true
	}
})

console.log(JSON.stringify(Vi, undefined, '\t'));
const [Vf] = villain.process(Vi, villain.actions.translate(33, 33))
console.log(JSON.stringify(Vf, undefined, '\t'));

console.log('***** array op output *******');

const characterList = state.array(character, (s, t) => s.hp === t.target);
const cl = characterList.instance([]);
const dispatch = state.createStateletDispatcher(cl, characterList, (store) => {
	console.log('state', store);
})
dispatch(characterList.actions.add({block: true, hp: 10, pos: { x: 0, y: 1 }}))
dispatch(characterList.actions.add({block: true, hp: 11, pos: { x: 0, y: 1 }}))
dispatch(characterList.actions.add({block: true, hp: 100, pos: { x: 0, y: 1 }}))
dispatch(characterList.actions.remove({target: 11 }))
const target1 = state.target(characterList.actions.move(10, 10), { target: 100 });
dispatch(target1);

// const characterWithMinions = state.combine(
// 	character,
// 	state.embed(characterList, (s) => ({ minions: s}), (w) => w.minions)
// );

// characterWithMinions.instance({
// 	block: true,
// 	hp: 100,
// 	pos: { x: 1, y: 2},
// 	minions: [],
// })

