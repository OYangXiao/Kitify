import { Err } from "./err";
import { Ok } from "./ok";

interface BaseResult<T, E> {
  
    is_ok(): this is Ok<T>;
    is_ok_and(predicate: (val: T) => boolean): boolean;
    is_err(): this is Err<E>;
    is_err_and(predicate: (err: E) => boolean): boolean;

    // Returns the contained `Ok` or `Err` value, if exists. Throws an error if not expected.
    unwrap(exception_msg_if_err?: string): T | never;
    unwrap_err(exception_msg_if_ok?: string): E | never;

    // Returns the contained `Ok` value or a provided default when its Err.
    unwrap_or<T2>(v: T2): T | T2;
    unwrap_or_else<T2>(f: (err: E) => T2): T | T2;

     // Calls op if the result is Ok or Err, otherwise returns the opposite value of self.
    and<T2>(v: T2): Result<T2, E>;
    and_then<T2>(f: (v: T) => Result<T2, E>): Result<T2, E>;

    or<E2>(v: Result<T, E2>): Result<T, E2>;
    or_else<E2>(f:(err: E) => Result<T, E2>): Result<T, E2>;

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

export type Result<T, E = unknown> = Ok<T> | Err<E>;
