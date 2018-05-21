import { JSONSchema6TypeName, JSONSchema6 } from "json-schema";
import { reduce, isObject } from "lodash";

interface TypeDescriptor {
    rawType: JSONSchema6;
    required: boolean;
}

type TypeDescriptorOptions = { required: boolean; };

interface SchemaDescriptor { }

const schemaDescriptorReducer = (sche: JSONSchema6, curr: object, key: string) => {
    if (isObject(curr)) {
        sche.properties[key] = schemaDescriptorReducer(sche, curr, key);
    } else {
        sche.properties[key] = curr;
    }
    return sche;
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
    {}
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
        rawType: {
            type: 'array',
            items: normalize(typeDescriptor).rawType
        },
        required: false
    }, options && options.required ? options.required : false)

    export const definition = ($ref: string): TypeDescriptor => ({
        rawType: { $ref },
        required: false
    })

    export const type = (type: JSONSchema6TypeName, options?: TypeDescriptorOptions): TypeDescriptor => constraints.required({
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