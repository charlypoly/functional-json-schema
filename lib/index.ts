import { JSONSchema6TypeName, JSONSchema6 } from "json-schema";
import { reduce, isObject, get, omit, filter, each, map, compact, assign } from "lodash";

interface TypeDescriptor {
    __typename: 'TypeDescriptor',
    rawType: JSONSchema6;
    required: boolean;
}

type TypeDescriptorOptions = { required: boolean; };

interface SchemaDescriptor {
    [k: string]: TypeDescriptor | SchemaDescriptor;
}

const isTypeDescriptor = (value: object): value is TypeDescriptor => {
    return get(value, '__typename') === 'TypeDescriptor'
}

const getRequired = (properties: SchemaDescriptor) => {
    return compact(
        map(properties, (type, k) => isTypeDescriptor(type) && type.required ? k : undefined)
    );
}

const schemaDescriptorReducer = (result: JSONSchema6, curr: SchemaDescriptor | TypeDescriptor, key: string) => {
    if (!isTypeDescriptor(curr)) {
        result.properties[key] = {
            type: 'object',
            required: getRequired(curr),
            properties: {}
        }
        each(curr, (v, k) => {
            (result.properties[key] as JSONSchema6).properties[k] = {
                ...omit(schemaDescriptorReducer((result.properties[key] as JSONSchema6), v, k), ['required', '__typename']),
            } as any;
        })
    } else {
        result = curr.rawType;
    }
    return result;
};

interface SchemaDescriptorOptions {
    schema: JSONSchema6['$schema'];
}

export const schema = (
    schemaDescriptor: SchemaDescriptor,
    definitions?: JSONSchema6['definitions'],
    options?: SchemaDescriptorOptions
): JSONSchema6 => reduce<SchemaDescriptor, JSONSchema6>(
    schemaDescriptor,
    schemaDescriptorReducer,
    {
        type: 'object',
        properties: {}
    }
)

export namespace types {

    export const normalize = (typeDescriptor: TypeDescriptor | JSONSchema6TypeName): TypeDescriptor => {
        if (typeof typeDescriptor === 'string') {
            return type(typeDescriptor);
        } else {
            return typeDescriptor
        }
    }

    export const arrayOf = (typeDescriptor: TypeDescriptor | JSONSchema6TypeName, options?: TypeDescriptorOptions): TypeDescriptor => constraints.required({
        __typename: 'TypeDescriptor',
        rawType: {
            type: 'array',
            items: normalize(typeDescriptor).rawType
        },
        required: false
    }, options && options.required ? options.required : false)

    export const definition = ($ref: string): TypeDescriptor => ({
        __typename: 'TypeDescriptor',
        rawType: { $ref },
        required: false
    })

    export const type = (type: JSONSchema6TypeName, options?: TypeDescriptorOptions): TypeDescriptor => constraints.required({
        __typename: 'TypeDescriptor',
        rawType: { type },
        required: false
    }, options && options.required ? options.required : false)
}

export namespace constraints {
    export const required = (typeDescriptor: TypeDescriptor, required: boolean): TypeDescriptor => ({
        ...typeDescriptor,
        required
    })
    export const pattern = (reg: RegExp) => { }
}

// DSL example

// const JSONschema = schema({
//     person: {
//         friends: types.arrayOf(types.definition('user')),
//         id: 'string*',
//         friend_ids: types.arrayOf(types.definition('User'), { required: true }),
//     }
// }, null, { schema: 'http://json-schema.org/draft-06/schema#' })