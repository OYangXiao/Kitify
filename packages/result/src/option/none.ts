import { BaseOption, OptionType } from "./base";
import { Some } from "./some";


/**
 * Contains the None value
 */
class NoneImpl implements BaseOption<never> {

  is_some = (): this is Some<never> => false;
  is_some_and = (_predicate: (val: never) => boolean): boolean => false;
  is_none = (): this is None => true;

  unwrap_or_default = <T2>(val: T2) => val;
  unwrap_or_else = <T2>(f: () => T2) => f();
  unwrap(): never { throw new Error('failed to unwrap: this option is "None".') }

  and_then = () => None;
  or_else = <T2>(op: OptionType<T2> | (() => OptionType<T2>)) =>
    typeof op === 'function' ? (op as (() => OptionType<T2>))() : op;

  map_some = <T2>(_op: (val: never) => T2): OptionType<T2> => None;
  map_none = <T2>(op: () => T2): OptionType<T2> => Some(op());

  inspect_some = () => this
  inspect_none = (op: () => void) => { op(); return this }

  to_result = <E>(error: E): Err<E> => Err(error);
}

// Export None as a singleton, then freeze it so it can't be modified
export const None = new NoneImpl();
export type None = NoneImpl;
Object.freeze(None);


