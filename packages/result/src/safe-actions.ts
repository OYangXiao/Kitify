import { Err, Ok, Result } from "./result";
import { None, Some } from "./option";

export function is_non_empty_string(val: unknown): val is string {
    return !!val && typeof val === 'string'
}

function to_string_or_json(val: unknown): Result<string, Error> {
    let value = String(val);
    if (value === '[object Object]') {
        try {
            value = JSON.stringify(val);
            return Ok(value)
        } catch (e) {
            return Err(e as Error);
        }
    }
    return Ok(value);
}

function json_stringify(val: unknown): Result<string, Error> {
    if (val === undefined) {
        return Err(new Error("input is undefined"));
    }

    try {
        const json = JSON.stringify(val);
        return Ok(json);
    } catch (e) {
        return Err(e as Error);
    }
}

function json_parse<T>(val: string | undefined | null): Result<T, Error> {
    if (typeof val !== 'string') {
        return Err(new Error("JSON.parse input is not a string"));
    }

    return Result.wrap(() => JSON.parse(val) as T);
}


const _fetch_result = (type: 'text' | 'json') => <T>(url: unknown): Promise<Result<T, Error>> =>
    is_non_empty_string(url) ?
        fetch(url)
            .then(res => res[type]())
            .then(text => Ok(text))
            .catch(e => Err(e as Error))
        : Promise.resolve(Err(new Error('fetch input must be a non-empty string')))

const fetch_json = _fetch_result('json')
const fetch_text = _fetch_result('text')<string>

const storage_get = (storage: 'localStorage' | 'sessionStorage') => (key: string) => {
    const content = window[storage].getItem(key);
    return typeof content === 'string' ? Some(content) : None;
}

const storage_get_json = (storage: 'localStorage' | 'sessionStorage') =>
    <T>(key: string) => {
        const data = storage_get(storage)(key)
        return data.is_some() ? Ok(data._unwrap() as T) : Err(new Error("storage_get_json failed"))
    }

const local_storage_get = storage_get("localStorage");
const session_storage_get = storage_get("sessionStorage");

const local_storage_get_json = storage_get_json("localStorage");
const session_storage_get_json = storage_get_json("sessionStorage");

export const safe_actions = {
    to_string: to_string_or_json,

    json: {
        stringify: json_stringify,
        parse: json_parse,
    },

    fetch: {
        json: fetch_json,
        text: fetch_text,
    },

    storage: {
        local: {
            get: local_storage_get,
            get_json: local_storage_get_json,
        },
        session: {
            get: session_storage_get,
            get_json: session_storage_get_json,
        }
    }
}