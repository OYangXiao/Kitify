import { Option, OptionSomeTypes } from "./base";
import { None } from "./none";
import { Some } from "./some";

export type Option<T> = Option<T>

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
