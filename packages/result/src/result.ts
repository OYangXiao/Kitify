import { safe_actions } from '../safe-actions';
import { Option, None, Some } from './option';




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
