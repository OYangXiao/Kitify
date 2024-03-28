export class ErrImpl<E> implements BaseResult<never, E> {
    readonly #val!: E;

    constructor(val: E) {
        this.#val = val;
    }

    is_ok = () => false;
    is_ok_and = () => false;

    is_err = () => true;
    is_err_and = (predicate: (err: E) => boolean) => predicate(this.#val);

    _unwrap(msg_if_err?: string): never {
        throw new Error(
            `${msg_if_err}${msg_if_err ? " - " : ""
            }Tried to unwrap, but this result is Err: ${safe_actions.to_string(this.#val)}`,
        );
    }
    _unwrap_err = () => this.#val;

    unwrap_or<T2>(default_val_if_err: T2 | ((err: E) => T2)): T2 {
        return typeof default_val_if_err === "function"
            ? (default_val_if_err as ((err: E) => T2))(this.#val)
            : default_val_if_err;
    }

    and_then = (): Result<never, E> => new Err(this.#val);
    or_else<T2, E2>(val_if_err: Result<T2, E2> | ((err: E) => Result<T2, E2>)): Result<never | T2, E2> {
        return typeof val_if_err === "function" ? val_if_err(this.#val) : val_if_err;
    }

    map_ok = (): Result<never, E> => new Err(this.#val);
    map_err = <E2>(op: (err: E) => E2): Result<never, E2> => new Err(op(this.#val));

    inspect_ok = () => this;
    inspect_err(op: (err: E) => void): Result<never, E> {
        op(this.#val);
        return this;
    }

    to_option = (): Option<never> => None;

    toString = () => `Err: ${safe_actions.to_string(this.#val)}`;
}

// This allows Err to be callable - possible because of the es5 compilation target
export const Err = ErrImpl as typeof ErrImpl & (<E>(err: E) => Err<E>);
export type Err<E> = ErrImpl<E>;


