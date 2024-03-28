export class OkImpl<T> implements BaseResult<T, never> {
    readonly #val!: T;

    constructor(val: T) {
        this.#val = val;
    }

    is_ok = () => true;
    is_ok_and = (predicate: (val: T) => boolean) => predicate(this.#val);

    is_err = () => false;
    is_err_and = () => false;

    _unwrap = () => this.#val;
    _unwrap_err(msg_if_ok?: string): never {
        throw new Error(`${msg_if_ok}${msg_if_ok ? " - " : ""
            }Tried to unwrap, but this result is Ok: ${safe_actions.to_string(this.#val)}`);
    }

    unwrap_or = () => this.#val;

    and_then<T2, E2>(val_if_ok: Result<T2, E2> | ((val: T) => Result<T2, E2>)): Result<T2, never | E2> {
        return typeof val_if_ok === "function" ? val_if_ok(this.#val) : val_if_ok;
    }
    or_else = (): Result<T, never> => Ok(this.#val);

    map_ok = <T2>(op: (val: T) => T2): Result<T2, never> => new Ok(typeof op === 'function' ? op(this.#val) : op);
    map_err = (): Result<T, never> => new Ok(this.#val);

    inspect_ok(op: (val: T) => void): Result<T, never> {
        op(this.#val);
        return this;
    }
    inspect_err = () => this;

    to_option = (): Option<T> => Some(this.#val);

    toString = () => `Ok: ${safe_actions.to_string(this.#val)}`;
}

// This allows Ok to be callable - possible because of the es5 compilation target
export const Ok = OkImpl as typeof OkImpl & (<T>(val: T) => Ok<T>);
export type Ok<T> = OkImpl<T>;


