export interface Action<E, T> {
	type: E;
	payload: T;
}

export type Reducer<T, A> = (state: T, action: A) => T;
export type Acceptor<T, A> = (state: T, action: A) => boolean;
export type Dispatch<A> = (action: A) => void;
export type Spawner<T, A> = (action: A) => ((state: T) => A[]) | undefined;
export interface Interceptor<S, A> {
	emitter?: (dispatch: Dispatch<A>) => void;
	onDispatched?: (state: S, action: A) => A | undefined;
	onReduced?: (state: S, action: A) => A | undefined;
}
export type Dispatcher<T, A> = (cb: (state: T) => void) => Dispatch<A>;

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
				const creator = spawner(currentAction);
				if (creator) {
					const createdActions = creator(newState);
					actionStack.unshift(...createdActions); // maybe using a stack would be better
				}
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
