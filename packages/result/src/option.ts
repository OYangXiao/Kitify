import { safe_actions } from './safe-actions';
import { Result, Ok, Err } from './result';

interface BaseOption<T> {

    is_some(): this is Some<T>;
    is_some_and(predicate: (val: T) => boolean): boolean;

    is_none(): this is None;

    /**
     * Returns the contained `Some` value.
     */
    _unwrap(msg_if_none?: string): T | never;

    /**
     * Returns the contained `Some` value or a provided default.
     */
    unwrap_or<T2>(val: T2 | (() => T2)): T | T2;

    /**
     * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
     */
    and_then<T2>(op: Option<T2> | ((val: T) => Option<T2>)): Option<T2>;
    or_else<T2>(op: Option<T2> | (() => Option<T2>)): Option<T | T2>;

    /**
     * Maps an `Option<T>` to `Option<T2>` by applying a function to a contained value.
     */
    map_some<T2>(op: (val: T) => T2): Option<T2>;
    map_none<T2>(op: () => T2): Option<T | T2>;

    inspect_some(op: (val: T) => void): Option<T>;
    inspect_none(op: () => void): Option<T>;

    /**
     * Maps an `Option<T>` to a `Result<T, E>`.
     */
    to_result<E>(error: E): Result<T, E>;
}

/**
 * Contains the None value
 */
class NoneImpl implements BaseOption<never> {

    is_some = (): this is Some<never> => false;
    is_some_and = (_predicate: (val: never) => boolean): boolean => false;

    is_none = (): this is None => true;

    _unwrap(): never {
        throw new Error('Tried to unwrap, but this option is None.');
    }
    unwrap_or = <T2>(val: T2 | (() => T2)) =>
        typeof val === 'function' ? (val as (() => T2))() : val;

    and_then = () => None;
    or_else = <T2>(op: Option<T2> | (() => Option<T2>)) =>
        typeof op === 'function' ? (op as (() => Option<T2>))() : op;

    map_some = <T2>(_op: (val: never) => T2): Option<T2> => None;
    map_none = <T2>(op: () => T2): Option<T2> => Some(op());

    inspect_some = () => this
    inspect_none = (op: () => void) => { op(); return this }

    to_result = <E>(error: E): Err<E> => Err(error);

    toString = () => 'None';
}

// Export None as a singleton, then freeze it so it can't be modified
export const None = new NoneImpl();
export type None = NoneImpl;
Object.freeze(None);

/**
 * Contains the success value
 */
class SomeImpl<T> implements BaseOption<T> {
    readonly #val!: T;

    constructor(val: T) {
        this.#val = val;
    }

    is_some = (): this is Some<T> => true;
    is_some_and = (predicate: (val: T) => boolean) => predicate(this.#val);

    is_none = (): this is None => false;

    _unwrap = () => this.#val;
    unwrap_or = (_val: unknown) => this.#val;

    and_then = <T2>(op: Option<T2> | ((val: T) => Option<T2>)): Option<T2> =>
        typeof op === 'function' ? op(this.#val) : op;
    or_else<T2>(_op: Option<T2> | (() => Option<T2>)): Option<T | T2> {
        return this as Some<T | T2>;
    }

    map_some = <T2>(op: (val: T) => T2): Option<T2> => Some(op(this.#val));
    map_none = <T2>(op: () => T2): Option<T | T2> => Some(op());

    inspect_some = (op: (val: T) => void) => {
        op(this.#val);
        return this;
    }
    inspect_none = () => this

    to_result = <E>(error: E): Result<T, E> => Ok(this.#val);

    toString = () => `Some: ${safe_actions.to_string(this.#val)}`;
}

// This allows Some to be callable - possible because of the es5 compilation target
export const Some = SomeImpl as typeof SomeImpl & (<T>(val: T) => SomeImpl<T>);
export type Some<T> = SomeImpl<T>;

export type Option<T> = Some<T> | None;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type OptionSomeType<T extends Option<any>> = T extends Some<infer U> ? U : never;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type OptionSomeTypes<T extends Option<any>[]> = {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key in keyof T]: T[key] extends Option<any> ? OptionSomeType<T[key]> : never;
};

export namespace Option {
    /**
     * Parse a set of `Option`s, returning an array of all `Some` values.
     * Short circuits with the first `None` found, if any
     */

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export function all<T extends Option<any>[]>(...options: T): Option<OptionSomeTypes<T>> {
        const someOption = [];
        for (const option of options) {
            if (option.is_some()) {
                someOption.push(option._unwrap());
            } else {
                return option as None;
            }
        }

        return Some(someOption as OptionSomeTypes<T>);
    }

    /**
     * Parse a set of `Option`s, short-circuits when an input value is `Some`.
     * If no `Some` is found, returns `None`.
     */

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export function any<T extends Option<any>[]>(...options: T): Option<OptionSomeTypes<T>[number]> {
        // short-circuits
        for (const option of options) {
            if (option.is_some()) {
                return option as Some<OptionSomeTypes<T>[number]>;
            }
            return option as None;
        }

        // it must be None
        return None;
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export function is_option<T = any>(value: unknown): value is Option<T> {
        return value instanceof Some || value === None;
    }
}
