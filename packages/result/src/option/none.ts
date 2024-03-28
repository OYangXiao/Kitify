import { BaseOption, Option } from "./base";
import { Some } from "./some";

const name = 'Option Type: None'


/**
 * Contains the None value
 */
class NoneImpl<T> implements BaseOption<T> {

  is_some = (): this is Some<T> => false;
  is_some_and = return_false;
  is_none = (): this is None<T> => true;

  unwrap = throw_None;

  unwrap_or = (v: T) => v;
  unwrap_or_else = (f: () => T) => f();

  and = return_None;
  and_then = return_None;

  or = (v: Option<T>) => v;
  or_else = (f: () => Option<T>) => f();

  map = <T2>(param: { default?: T2; none?: () => T2; }) =>
    param.none ? Some(param.none()) : param.default ? Some(param.default) : this;

  inspect_some = () => this
  inspect_none = (f: () => never) => { f() }

  to_result = <E>(error: E): Result<T, E> => Err(error);

  toString = return_name;
}

const exception_error = new Error(`failed to unwrap: this is ${name}`);

const None = Object.freeze(new NoneImpl())
const return_None = () => None;
const return_false = () => false;
const throw_None = () => { throw exception_error };
const return_name = () => name;

// Export None as a singleton, then freeze it so it can't be modified
export type None<T> = NoneImpl<T>;


