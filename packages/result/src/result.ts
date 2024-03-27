import { safe_actions } from '../safe-actions';
import { Option, None, Some } from './option';

interface BaseResult<T, E> {

    is_ok(): this is Ok<T>;
    is_ok_and(predicate: (val: T) => boolean): boolean;

    is_err(): this is Err<E>;
    is_err_and(predicate: (err: E) => boolean): boolean;

    /**
     * Returns the contained `Ok` or `Err` value, if exists.  Throws an error if not expected.
     */
    _unwrap(msg_if_err?: string): T | never;
    _unwrap_err(msg_if_ok?: string): E | never;

    /**
     * Returns the contained `Ok` value or a provided default when its Err.
     */
    unwrap_or<T2>(val_if_err: T2 | ((err: E) => T2)): T | T2;

    /**
     * Calls op if the result is Ok or Err, otherwise returns the opposite value of self.
     */
    and_then<T2, E2>(val_if_ok: Result<T2, E2> | ((val: T) => Result<T2, E2>)): Result<T2, E | E2>;
    or_else<T2, E2>(val_if_err: Result<T2, E2> | ((err: E) => Result<T2, E2>)): Result<T | T2, E2>;

    /**
     * Maps a `Result<T, E>` to `Result<T2, E>` by applying a function to a contained `Ok` value, 
     * 
     * Maps a `Result<T, E>` to `Result<T, E2>` by applying a function to a contained `Err` value, 
     */
    map_ok<T2>(op: (val: T) => T2): Result<T2, E>;
    map_err<E2>(op: (err: E) => E2): Result<T, E2>;

    /**
     * Allows for side-effects to be run on the Ok or Err value if it is present. 
     */
    inspect_ok(op: (val: T) => void): Result<T, E>;
    inspect_err(op: (err: E) => void): Result<T, E>;

    /**
     *  Converts from `Result<T, E>` to `Option<T>`, discarding the error if any
     */
    to_option(): Option<T>;
}

/**
 * Contains the error value
 */
export class ErrImpl<E> implements BaseResult<never, E> {
    readonly #val!: E;

    constructor(val: E) {
        this.#val = val;
    }

    is_ok = () => false;
    is_ok_and = () => false;

    is_err = () => true;
    is_err_and = (predicate: (err: E) => boolean) => predicate(this.#val);

    _unwrap(msg_if_err?: string): never {
        throw new Error(
            `${msg_if_err}${msg_if_err ? " - " : ""
            }Tried to unwrap, but this result is Err: ${safe_actions.to_string(this.#val)}`,
        );
    }
    _unwrap_err = () => this.#val;

    unwrap_or<T2>(default_val_if_err: T2 | ((err: E) => T2)): T2 {
        return typeof default_val_if_err === "function"
            ? (default_val_if_err as ((err: E) => T2))(this.#val)
            : default_val_if_err;
    }

    and_then = (): Result<never, E> => new Err(this.#val);
    or_else<T2, E2>(val_if_err: Result<T2, E2> | ((err: E) => Result<T2, E2>)): Result<never | T2, E2> {
        return typeof val_if_err === "function" ? val_if_err(this.#val) : val_if_err;
    }

    map_ok = (): Result<never, E> => new Err(this.#val);
    map_err = <E2>(op: (err: E) => E2): Result<never, E2> => new Err(op(this.#val));

    inspect_ok = () => this;
    inspect_err(op: (err: E) => void): Result<never, E> {
        op(this.#val);
        return this;
    }

    to_option = (): Option<never> => None;

    toString = () => `Err: ${safe_actions.to_string(this.#val)}`;
}

// This allows Err to be callable - possible because of the es5 compilation target
export const Err = ErrImpl as typeof ErrImpl & (<E>(err: E) => Err<E>);
export type Err<E> = ErrImpl<E>;

/**
 * Contains the success value
 */
export class OkImpl<T> implements BaseResult<T, never> {
    readonly #val!: T;

    constructor(val: T) {
        this.#val = val;
    }

    is_ok = () => true;
    is_ok_and = (predicate: (val: T) => boolean) => predicate(this.#val);

    is_err = () => false;
    is_err_and = () => false;

    _unwrap = () => this.#val;
    _unwrap_err(msg_if_ok?: string): never {
        throw new Error(`${msg_if_ok}${msg_if_ok ? " - " : ""
            }Tried to unwrap, but this result is Ok: ${safe_actions.to_string(this.#val)}`);
    }

    unwrap_or = () => this.#val;

    and_then<T2, E2>(val_if_ok: Result<T2, E2> | ((val: T) => Result<T2, E2>)): Result<T2, never | E2> {
        return typeof val_if_ok === "function" ? val_if_ok(this.#val) : val_if_ok;
    }
    or_else = (): Result<T, never> => Ok(this.#val);

    map_ok = <T2>(op: (val: T) => T2): Result<T2, never> => new Ok(typeof op === 'function' ? op(this.#val) : op);
    map_err = (): Result<T, never> => new Ok(this.#val);

    inspect_ok(op: (val: T) => void): Result<T, never> {
        op(this.#val);
        return this;
    }
    inspect_err = () => this;

    to_option = (): Option<T> => Some(this.#val);

    toString = () => `Ok: ${safe_actions.to_string(this.#val)}`;
}

// This allows Ok to be callable - possible because of the es5 compilation target
export const Ok = OkImpl as typeof OkImpl & (<T>(val: T) => Ok<T>);
export type Ok<T> = OkImpl<T>;

export type Result<T, E = unknown> = Ok<T> | Err<E>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ResultOkType<T extends Result<any, any>> = T extends Ok<infer U> ? U : never;
export type ResultErrType<T> = T extends Err<infer U> ? U : never;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ResultOkTypes<T extends Result<any, any>[]> = {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key in keyof T]: T[key] extends Result<infer U, any> ? ResultOkType<T[key]> : never;
};
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ResultErrTypes<T extends Result<any, any>[]> = {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key in keyof T]: T[key] extends Result<infer U, any> ? ResultErrType<T[key]> : never;
};

export namespace Result {
    /**
     * Parse a set of `Result`s, returning an array of all `Ok` values.
     * Short circuits with the first `Err` found, if any
     */

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export function all<T extends Result<any, any>[]>(
        ...results: T
    ): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]> {
        const okResult = [];
        for (const result of results) {
            if (result.is_ok()) {
                okResult.push(result._unwrap());
            } else {
                return result as Err<ResultErrTypes<T>[number]>;
            }
        }

        return new Ok(okResult as ResultOkTypes<T>);
    }

    /**
     * Parse a set of `Result`s, short-circuits when an input value is `Ok`.
     * If no `Ok` is found, returns an `Err` containing the collected error values
     */

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export function any<T extends Result<any, any>[]>(
        ...results: T
    ): Result<ResultOkTypes<T>[number], ResultErrTypes<T>> {
        const errResult = [];

        // short-circuits
        for (const result of results) {
            if (result.is_ok()) {
                return result as Ok<ResultOkTypes<T>[number]>;
            }
            errResult.push(result._unwrap_err());
        }

        // it must be a Err
        return new Err(errResult as ResultErrTypes<T>);
    }

    /**
     * Wrap an operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrap<T, E = unknown>(op: () => T): Result<T, E> {
        try {
            return new Ok(op());
        } catch (e) {
            return new Err<E>(e as E);
        }
    }

    /**
     * Wrap an async operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrap_async<T, E = unknown>(op: () => Promise<T>): Promise<Result<T, E>> {
        try {
            return op()
                .then((val) => new Ok(val))
                .catch((e) => new Err(e));
        } catch (e) {
            return Promise.resolve(new Err(e as E));
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export function is_result<T = any, E = any>(val: unknown): val is Result<T, E> {
        return val instanceof Err || val instanceof Ok;
    }
}
