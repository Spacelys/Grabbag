/* eslint-disable @typescript-eslint/semi */
export interface Action<T, P> {
	type: T;
	payload: P;
}
interface Target { target?: any }
export type TargetAction<A extends Action<any, any>> = A & Target;
// export type TargetAction2 = <A extends Action<symbol, { target: any, }>>

export const target = <A extends Action<any, any>, T>(a: A, t: T): TargetAction<A> => ({
	...a,
	target: t,
})

export type Reducer<T, A> = (state: T, action: A) => T;
export type Acceptor<T, A> = (state: T, action: A) => boolean;
export type Dispatch<A> = (action: A) => void;
export type Spawner<T, A> = (state: T, action: A) => A[];

export interface BaseStatelet<State, Actions> {
	reducer: Reducer<State, Actions>;
	acceptor: Acceptor<State, Actions>;
	spawner: Spawner<State, Actions>;
}
export interface StateletCreator<State, Actions> extends BaseStatelet<State, Actions> {
	withActions: <Ops>(actions: Ops) => StateletWithOps<State, Actions, Ops>;
}

export interface StateletWithOps<State, Actions, Ops> extends BaseStatelet<State, Actions> {
	actions: Ops;
	instance: (state: State) => State;
	process: (state: State, action: Actions) => [State, Actions[]];
}

export const create = <State, Actions>(
	{ reducer, acceptor = () => true, spawner = () => [] }: {
		reducer: Reducer<State, Actions>;
		acceptor?: Acceptor<State, Actions>;
		spawner?: Spawner<State, Actions>;
	}): StateletCreator<State, Actions> => {
	const statelet = {
		reducer,
		acceptor,
		spawner,
	};
	const withActions = <Ops>(actions: Ops): StateletWithOps<State, Actions, Ops> => ({
		...statelet,
		actions,
		instance: (state: State) => state,
		process: (state: State, action: Actions) => {
			const newState = statelet.reducer(state, action);
			const spawnedActions = statelet.spawner(state, action);
			return [newState, spawnedActions];
		},
	});
	return { ...statelet, withActions };
};

export const embed = <State, Actions, W, Ops>(
	statelet: StateletWithOps<State, Actions, Ops>,
	wrap: (w: State) => W,
	unwrap: (u: W) => State,
	// eslint-disable-next-line arrow-body-style
): StateletWithOps<W, Actions, Ops> => {
	const acceptor: Acceptor<W, Actions> = (state, action) => statelet.acceptor(unwrap(state), action);
	const reducer: Reducer<W, Actions> = (state, action) => wrap(statelet.reducer(unwrap(state), action));
	const spawner: Spawner<W, Actions> = (state, action) => statelet.spawner(unwrap(state), action);

	return {
		acceptor,
		reducer,
		spawner,
		actions: statelet.actions,
		instance: (state: W) => state,
		process: (state: W, action: Actions) => {
			const newState = reducer(state, action);
			const spawnedActions = spawner(state, action);
			return [newState, spawnedActions];
		},
	};
};

const combineAcceptor = <S1, S2, A1, A2>(
	acceptor1: Acceptor<S1, A1>,
	acceptor2: Acceptor<S2, A2>): Acceptor<S1 & S2, A1 | A2> => (state: S1 & S2, act: A1 | A2) => acceptor1(
	state, act as A1
) && acceptor2(
	state, act as A2
);

const combineReducer = <S1, S2, A1, A2>(
	reducer1: Reducer<S1, A1>, reducer2: Reducer<S2, A2>
	// eslint-disable-next-line arrow-body-style
): Reducer<S1 & S2, A1 | A2> => {
	return (state: S1 & S2, act: A1 | A2) => {
		const r1 = reducer1(state, act as A1);
		const r2 = reducer2(state, act as A2);
		return { ...r1, ...r2 };
	}
};

const combineSpawner = <S1, S2, A1, A2>(
	spawner1: Spawner<S1, A1>,
	spawner2: Spawner<S2, A2>
	// eslint-disable-next-line arrow-body-style
): Spawner<S1 & S2, A1 | A2> => {
	return (state: S1 & S2, action: A1 | A2) => [...spawner1(state, action as A1), ...spawner2(state, action as A2)]
}

export const combine = <S1, S2, A1, A2, O1, O2>(
	statelet1: StateletWithOps<S1, A1, O1>,
	statelet2: StateletWithOps<S2, A2, O2>
	// eslint-disable-next-line arrow-body-style
): StateletWithOps<S1 & S2, A1 | A2, O1 & O2> => {
	const reducer = combineReducer(statelet1.reducer, statelet2.reducer);
	const spawner = combineSpawner(statelet1.spawner, statelet2.spawner);

	const statelet = {
		acceptor: combineAcceptor(statelet1.acceptor, statelet2.acceptor),
		reducer,
		spawner,
		actions: { ...statelet1.actions, ...statelet2.actions },
		instance: (s: S1 & S2) => s,
		process: (state: S1 & S2, action: A1 | A2): [S1 & S2, (A1 | A2)[]] => {
			const newState = reducer(state, action);
			const spawnedActions = spawner(state, action);
			return [newState, spawnedActions];
		},
	};
	return statelet;
};

/*
state = array(S1, (s: S, id: {focus: number}) => s.x === focus)
*/

type builtInAdd<S> = Action<symbol, S>;
type builtInRemove<S> = Action<symbol, S>;
export const array = <S, A extends Action<any, any>, O>(
	statelet: StateletWithOps<S, A, O>,
	idFunc: (s: S, t: Target) => boolean
	// eslint-disable-next-line arrow-body-style
): StateletWithOps<S[], A | builtInAdd<S> | builtInRemove<Target> | TargetAction<A>, O & {
	add: (s: S) => builtInAdd<S>;
	remove: (t: Target) => builtInRemove<Target>;
}> => {
	const addSymbol = Symbol();
	const removeSymbol = Symbol();

	const add = (s: S[], x: S): S[] => [...s, x];
	const remove = (s: S[], t: Target): S[] => s.filter((x => !idFunc(x, t)));

	const reducer = (s: S[], a: TargetAction<A>) => {
		if (a.type === addSymbol) {
			return add(s, a.payload)
		}
		if (a.type === removeSymbol) {
			return remove(s, a.payload);
		}
		if (a.target) {
			return s.map((e) => idFunc(e, a.target) ? statelet.reducer(e, a) : e);
		}
		return s.map((e) => statelet.reducer(e, a));
	};

	const spawner = (s: S[], a: A) => s.reduce((acc, e) => [...acc, ...statelet.spawner(e, a)], [] as A[]);
	const actions = {
		...statelet.actions,
		add: (s: S): builtInAdd<S> => ({ type: addSymbol, payload: s }),
		remove: (t: Target): builtInRemove<Target> => ({ type: removeSymbol, payload: t }),
	}

	return {
		acceptor: (s: S[], a: A) => s.reduce((acc, e) => acc && statelet.acceptor(e, a), true),
		reducer,
		spawner,
		actions,
		instance: (s: S[]) => s,
		process: (state: S[], action: A): [S[], A[]] => {
			const newState = reducer(state, action);
			const spawnedActions = spawner(state, action);
			return [newState, spawnedActions];
		},
	};
};

export interface Interceptor<S, A> {
	emitter?: (dispatch: Dispatch<A>) => void;
	onDispatched?: (state: S, action: A) => A | undefined;
	onReduced?: (state: S, action: A) => A | undefined;
}

export type Dispatcher<T, A> = (cb: (state: T) => void) => Dispatch<A>;

export const createStateletDispatcher = <State, Actions, Ops>(
	initState: State,
	statelet: StateletWithOps<State, Actions, Ops>,
	store: (state: State) => void,
	interceptor?: Interceptor<State, Actions>,
): Dispatch<Actions> => {
	let state = initState;
	const actionStack: Actions[] = [];

	store(state); // we automatically call the store with the initial state
	const dispatch = (action: Actions) => {
		if (interceptor?.onDispatched) {
			const a = interceptor.onDispatched(state, action);
			if (a) {
				actionStack.push(a);
			}
		} else {
			actionStack.push(action);
		}
		// do not call the store until the current action stack is drained
		while (actionStack.length > 0) {
			const currentAction: Actions = actionStack.shift();
			if (statelet.acceptor(state, currentAction)) {
				const [newState, spawnedActions] = statelet.process(state, currentAction);
				if (interceptor?.onReduced) {
					interceptor.onReduced(state, currentAction);
				}
				actionStack.unshift(...spawnedActions);
				state = newState;
			}
		}
		store(state);
	};
	if (interceptor?.emitter) {
		interceptor.emitter(dispatch);
	}
	return dispatch;
};

export const createDispatcher = <State, Actions>(
	initState: State,
	reducer: Reducer<State, Actions>,
	acceptor: Acceptor<State, Actions>,
	spawner: Spawner<State, Actions>,
	store: (state: State) => void,
	interceptor?: Interceptor<State, Actions>,
): Dispatch<Actions> => {
	let state = initState;
	const actionStack: Actions[] = [];

	store(state); // we automatically call the store with the initial state
	const dispatch = (action: Actions) => {
		if (interceptor?.onDispatched) {
			const a = interceptor.onDispatched(state, action);
			if (a) {
				actionStack.push(a);
			}
		} else {
			actionStack.push(action);
		}
		// do not call the store until the current action stack is drained
		while (actionStack.length > 0) {
			const currentAction: Actions = actionStack.shift();
			if (acceptor(state, currentAction)) {
				const newState = reducer(state, currentAction);
				if (interceptor?.onReduced) {
					interceptor.onReduced(state, currentAction);
				}
				actionStack.unshift(...spawner(newState, currentAction));
				state = newState;
			}
		}
		store(state);
	};
	if (interceptor?.emitter) {
		interceptor.emitter(dispatch);
	}
	return dispatch;
};
