import { None } from "./none";
import { Some } from "./some";

export interface BaseOption<T> {

  is_some(): this is Some<T>;
  is_some_and(predicate: (val: T) => boolean): boolean;
  is_none(): this is None;

  // Returns the contained `Some` value or a provided default.
  unwrap_or_default<T2>(val: T2): T | T2;
  unwrap_or_else<T2>(f: () => T): T | T2;
  // unwrap content, throw if value is none, only for extract content 
  unwrap(error_msg_if_none: string): T | never;

  // if some, map to new content
  and<T2>(val: OptionType<T2>): OptionType<T2>;
  and_then<T2>(op:(val: T) => OptionType<T2>): OptionType<T2>;
  // if none, map to new content
  or<T2>(val: OptionType<T2>): OptionType<T | T2>;
  or_else<T2>(op: () => OptionType<T2>): OptionType<T | T2>;

  // Maps an `Option<T>` to `Option<T2>` by applying a function to a contained value.
  map_some<T2>(op: (val: T) => T2): OptionType<T2>;
  map_none<T2>(op: () => T2): OptionType<T2>;

  // for side effect
  inspect_some(op: (val: T) => void): OptionType<T>;
  inspect_none(op: () => void): OptionType<T>;

  // Maps an `Option<T>` to a `Result<T, E>`.
  to_result<E>(error: E): Result<T, E>;
}

export type OptionType<T> = Some<T> | None;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type OptionSomeType<T extends OptionType<any>> = T extends Some<infer U> ? U : never;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type OptionSomeTypes<T extends OptionType<any>[]> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key in keyof T]: T[key] extends OptionType<any> ? OptionSomeType<T[key]> : never;
};


