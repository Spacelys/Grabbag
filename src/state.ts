export interface Action<E, T> {
	type: E;
	payload: T;
}

export type Reducer<T, A> = (state: T, action: A) => T;
export type Acceptor<T, A> = (state: T, action: A) => boolean;
