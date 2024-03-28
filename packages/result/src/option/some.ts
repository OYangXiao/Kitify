import { BaseOption, Option } from "./base";
import { None } from "./none";

/**
 * Contains the success value
 */
class SomeImpl<T> implements BaseOption<T> {
  readonly #v!: T;
  constructor(v: T) { this.#v = v }

  is_some = (): this is Some<T> => true;
  is_some_and = (predicate: (val: T) => boolean) => predicate(this.#v);
  is_none = (): this is None<T> => false;

  unwrap = () => this.#v;
  unwrap_or = this.unwrap;
  unwrap_or_else = this.unwrap;

  and = <T2>(v: Option<T2>) => v;
  and_then = <T2>(f: (val: T) => Option<T2>) => f(this.#v)

  or = (_v: Option<T>) => this
  or_else = (_f: () => Option<T>) => this

  map = <T2>(param: { some?: ((v: T) => T2) }) =>
    param.some ? Some(param.some(this.#v)) : this;

  inspect_some = (f: (val: T) => never) => { f(this.#v) }
  inspect_none = () => this

  to_result = <E>(_error: E): Result<T, E> => Ok(this.#v);

  toString = () => `Option Type: Some, value: ${String(this.#v)}`;
}

// This allows Some to be callable - possible because of the es5 compilation target
export const Some = SomeImpl as typeof SomeImpl & (<T>(val: T) => SomeImpl<T>);
export type Some<T> = SomeImpl<T>;


