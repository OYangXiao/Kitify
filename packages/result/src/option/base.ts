import { None } from "./none";
import { Some } from "./some";

export interface BaseOption<T> {

  is_some(): this is Some<T>;
  is_some_and(predicate: (val: T) => boolean): boolean;
  is_none(): this is None;

  // unwrap content, throw if value is none, only for extract content 
  unwrap(exception_msg_if_none?: string): T | never;

  // Returns the contained `Some` value or a provided default.
  unwrap_or(v: T): T;
  unwrap_or_else(f: () => T): T;

  // if some, map to new content,
  // can map to a new type
  and<T2>(v: Option<T2>): Option<T2>;
  and_then<T2>(f: (v: T) => Option<T2>): Option<T2>;

  // if none, map to new content, but the same type
  or(v: Option<T>): Option<T>;
  or_else(f: () => Option<T>): Option<T>;

  // Maps an `Option<T>` to `Option<T2>` by applying a function to a contained value.
  map<T2>(param: { default?: T2, none?: () => T2, some?: (v: T) => T2 }): Option<T2>;

  // for side effect
  inspect_some(f: (v: T) => void): Option<T>;
  inspect_none(f: () => never): Option<T>;

  // Maps an `Option<T>` to a `Result<T, E>`.
  to_result<E>(error: E): Result<T, E>;

  toString(): string;
}

export type Option<T> = Some<T> | None;

// // biome-ignore lint/suspicious/noExplicitAny: <explanation>
// export type OptionSomeType<T extends Option<any>> = T extends Some<infer U> ? U : never;

// // biome-ignore lint/suspicious/noExplicitAny: <explanation>
// export type OptionSomeTypes<T extends Option<any>[]> = {
//   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
//   [key in keyof T]: T[key] extends Option<any> ? OptionSomeType<T[key]> : never;
// };


