import { JSONSchema6TypeName, JSONSchema6 } from "json-schema";
import { reduce, get, omit, each, map, compact } from "lodash";

export interface ArrayTypeDescriptor {
  __typename: "ArrayTypeDescriptor";
  name: keyof JSONSchema6;
  rawType: TypeDescriptor[];
  required: boolean;
}

export interface TypeDescriptor {
  __typename: "TypeDescriptor";
  rawType: JSONSchema6;
  required: boolean;
}

export interface TypeDescriptorOptions {
  required?: boolean;
  title?: string;
  description?: string;
}

export interface SchemaDescriptor {
  [k: string]: TypeDescriptor | ArrayTypeDescriptor | SchemaDescriptor;
}

const isTypeDescriptor = (value: object): value is TypeDescriptor => {
  return get(value, "__typename") === "TypeDescriptor";
};

const isArrayTypeDescriptor = (value: object): value is ArrayTypeDescriptor => {
  return get(value, "__typename") === "ArrayTypeDescriptor";
};

const getRequired = (properties: SchemaDescriptor) => {
  return compact(
    map(properties, (type, k) =>
      isTypeDescriptor(type) && type.required ? k : undefined
    )
  );
};

const schemaDescriptorReducer = (
  result: JSONSchema6,
  curr: SchemaDescriptor | TypeDescriptor | ArrayTypeDescriptor,
  key: string
) => {
  if (isArrayTypeDescriptor(curr)) {
    result = {
      [curr.name]: map(curr.rawType, (td) =>
        schemaDescriptorReducer(result, td, key)
      ),
    };
  } else if (isTypeDescriptor(curr) && isTypeDescriptor(curr.rawType)) {
    result = schemaDescriptorReducer({}, curr.rawType, key);
  } else if (isTypeDescriptor(curr)) {
    result = curr.rawType;
  } else {
    result.properties[key] = {
      type: "object",
      required: getRequired(curr),
      properties: {},
    };
    each(curr, (v, k) => {
      (result.properties[key] as JSONSchema6).properties[k] = {
        ...omit(
          schemaDescriptorReducer(result.properties[key] as JSONSchema6, v, k),
          ["required", "__typename"]
        ),
      } as any;
    });
  }
  return result;
};

export interface SchemaDescriptorOptions {
  schema: JSONSchema6["$schema"];
}

// {
//     $schema: 'http://json-schema.org/draft-06/schema#',
//     type: 'object',
//     properties: {
//         person: {
//         type: 'object',
//         properties: {
//             friends: {
//             "type": "array",
//             "items": {
//                 "$ref": "#/definitions/User"
//             }
//             },
//             (...)
//         },
//         required: ['friends', 'id']
//         }
//     }
// }
export const schema = (
  schemaDescriptor: SchemaDescriptor,
  definitions?: JSONSchema6["definitions"],
  options?: SchemaDescriptorOptions
): JSONSchema6 =>
  reduce<SchemaDescriptor, JSONSchema6>(
    schemaDescriptor,
    schemaDescriptorReducer,
    {
      type: "object",
      properties: {},
      ...(definitions ? { definitions } : {}),
      ...(options && options.schema ? { $schema: options.schema } : {}),
    }
  );

// {
//     "$ref": "#/definitions/User",
//     "definitions": {
//         "User": {
//             "type": "object",
//             "title": "User",
//             "description": "Fake User Object",
//             "properties": {
//                 "firstName": {
//                     "type": "string"
//                 },
//                 "lastName": {
//                     "type": "string"
//                 },
//                 "jobTitle": {
//                     "type": "string"
//                 },
//                 "companyId": {
//                     "type": "string"
//                 }
//             }
//         }
//     }
// }
export const definition = (
  name: string,
  schemaDescriptor: SchemaDescriptor,
  options?: { title?: string; description?: string }
): JSONSchema6 => ({
  $ref: `#/definitions/${name}`,
  definitions: {
    [name]: {
      ...options,
      ...(reduce<SchemaDescriptor, JSONSchema6>(
        { output: schemaDescriptor },
        schemaDescriptorReducer,
        {
          type: "object",
          properties: {},
        }
      ).properties.output as object),
    },
  },
});

const wrapMany = (name: keyof JSONSchema6) => (
  ...typeDescriptors: (TypeDescriptor | JSONSchema6TypeName)[]
): ArrayTypeDescriptor => ({
  __typename: "ArrayTypeDescriptor",
  required: false,
  name,
  rawType: typeDescriptors.map(types.normalize),
});

export namespace types {
  export const normalize = (
    typeDescriptor: TypeDescriptor | JSONSchema6TypeName
  ): TypeDescriptor => {
    if (typeof typeDescriptor === "string") {
      return type(typeDescriptor);
    } else {
      return typeDescriptor;
    }
  };

  export const allOf = wrapMany("allOf");
  export const anyOf = wrapMany("anyOf");
  export const oneOf = wrapMany("oneOf");
  export const enumOf = (...values: string[]): TypeDescriptor => ({
    __typename: "TypeDescriptor",
    rawType: { enum: values },
    required: false,
  });
  // export const not = wrap('not');

  export const arrayOf = (
    typeDescriptor: TypeDescriptor | JSONSchema6TypeName,
    options?: TypeDescriptorOptions
  ): TypeDescriptor => ({
    __typename: "TypeDescriptor",
    rawType: {
      type: "array",
      items: normalize(typeDescriptor).rawType,
    },
    required: false,
    ...options,
  });

  export const definition = (ref: string): TypeDescriptor => ({
    __typename: "TypeDescriptor",
    rawType: { $ref: `#/definitions/${ref}` },
    required: false,
  });

  export const type = (
    type: JSONSchema6TypeName,
    options?: TypeDescriptorOptions
  ): TypeDescriptor => ({
    __typename: "TypeDescriptor",
    rawType: { type },
    required: false,
    ...options,
  });
}

export namespace constraints {
  export const required = <T extends TypeDescriptor | ArrayTypeDescriptor>(
    typeDescriptor: T,
    required: boolean
  ): T => ({
    ...(typeDescriptor as any),
    required,
  });
  export const pattern = (reg: RegExp) => {};

  // default
}
