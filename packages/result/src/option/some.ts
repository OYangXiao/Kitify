import { BaseOption, OptionType } from "./base";
import { None } from "./none";

/**
 * Contains the success value
 */
class SomeImpl<T> implements BaseOption<T> {
  readonly #val!: T;
  constructor(val: T) { this.#val = val }

  is_some = (): this is Some<T> => true;
  is_some_and = (predicate: (val: T) => boolean) => predicate(this.#val);
  is_none = (): this is None => false;

  unwrap = () => this.#val;
  unwrap_or = (_val: unknown) => this.#val;

  and_then = <T2>(op: OptionType<T2> | ((val: T) => OptionType<T2>)): OptionType<T2> =>
    typeof op === 'function' ? op(this.#val) : op;
  or_else<T2>(_op: OptionType<T2> | (() => OptionType<T2>)): OptionType<T | T2> {
    return this as Some<T | T2>;
  }

  map_some = <T2>(op: (val: T) => T2): OptionType<T2> => Some(op(this.#val));
  map_none = <T2>(op: () => T2): OptionType<T2> => Some(op());

  inspect_some = (op: (val: T) => void) => {
    op(this.#val);
    return this;
  }
  inspect_none = () => this

  to_result = <E>(_error: E): Result<T, E> => Ok(this.#val);

  toString = () => `Some: ${this.#val}`;
}

// This allows Some to be callable - possible because of the es5 compilation target
export const Some = SomeImpl as typeof SomeImpl & (<T>(val: T) => SomeImpl<T>);
export type Some<T> = SomeImpl<T>;


