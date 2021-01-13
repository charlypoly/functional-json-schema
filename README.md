# functional-json-schema
Build a JSON Schema with functions



## Schema DSL

```js

import * as schema from 'functional-json-schema';

const JsonSchema = schema.schema({
  person: {
    friends: schema.types.arrayOf(schema.types.definition('user')),
        id: 'string*',
        friend_ids: schema.types.arrayOf(schema.types.definition('User'), { required: true }),
    }
}, null, { schema: 'http://json-schema.org/draft-06/schema#' })

/*
=> {
  $schema: 'http://json-schema.org/draft-06/schema#',
  type: 'object',
  properties: {
    person: {
      type: 'object',
      properties: {
        friends: {
          "type": "array",
          "items": {
            "$ref": "#/definitions/User"
          }
        },
        (...)
      },
      required: ['friends', 'id']
    }
  }
}
*/
```

## Definition DSL

```js

import * as schema from 'functional-json-schema';

const JsonSchemaDefinition = schema.definition(
  'User',
  {
    firstName: schema.types.type('string'),
    lastName: schema.types.type('string'),
    jobTitle: schema.types.type('string'),
    companyId: schema.types.type('string'),
  },
  { title: "User", description: "Fake User Object" }
)

/*
=> {
  "$ref": "#/definitions/User",
  "definitions": {
      "User": {
          "type": "object",
          "title": "User",
          "description": "Fake User Object",
          "properties": {
              "firstName": {
                  "type": "string"
              },
              "lastName": {
                  "type": "string"
              },
              "jobTitle": {
                  "type": "string"
              },
              "companyId": {
                  "type": "string"
              }
          },
          required: [],
      }
  }
}
*/
```
