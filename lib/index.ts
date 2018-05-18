import { JSONSchema6TypeName, JSONSchema6 } from "json-schema";
import { reduce, isObject } from "lodash";

interface TypeDescriptor {
    type: JSONSchema6;
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

export const schema = (schemaDescriptor: SchemaDescriptor): JSONSchema6 => reduce<SchemaDescriptor, JSONSchema6>(
    schemaDescriptor,
    schemaDescriptorReducer,
    {}
)

export namespace types {
    export const arrayOf = (typeDescriptor: TypeDescriptor, options?: TypeDescriptorOptions): TypeDescriptor => constraints.required({
        type: {
            type: 'array',
            items: typeDescriptor.type
        },
        required: false
    }, options.required ? options.required : false)

    export const definition = ($ref: string): TypeDescriptor => ({
        type: { $ref },
        required: false
    })

    export const type = (type: JSONSchema6TypeName, options?: TypeDescriptorOptions): TypeDescriptor => constraints.required({
        type: { type },
        required: false
    }, options.required ? options.required : false)
}

export namespace constraints {
    export const required = (typeDescriptor: TypeDescriptor, required: boolean): TypeDescriptor => ({
        ...typeDescriptor,
        required
    })
    export const pattern = (reg: RegExp) => { }
}

// DSL example

const JSONschema = schema({
    person: {
        friends: types.arrayOf(types.definition('user')),
        id: 'string*',
        friend_ids: types.arrayOf(types.definition('User'), { required: true }),
    }
})