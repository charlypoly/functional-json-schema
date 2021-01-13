# functional-json-schema
Build a JSON Schema with functions



## Schema DSL

### Simple schema

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
### Schema with definitions

```js

import * as schema from 'functional-json-schema';

const schemaWithDefinitions = schema(
  {
    community_list: {
      portfolio_ids: types.arrayOf("string", { required: true }),
      project_id: types.type("string", { required: true }),
      status: types.enumOf("active", "inactive"),
      user: types.anyOf(types.definition("User"), types.definition("Admin")),
    },
  }, {
    User: {
      firstName: types.type("string"),
      lastName: types.type("string"),
      jobTitle: types.type("string"),
      companyId: types.type("string"),
    },
  },
  { schema: 'http://json-schema.org/draft-06/schema#' }
);

/*
=> {
  $schema: 'http://json-schema.org/draft-06/schema#',
  type: "object",
  properties: {
    community_list: {
      type: "object",
      properties: {
        portfolio_ids: {
          type: "array",
          items: {
            type: "string",
          },
        },
        project_id: {
          type: "string",
        },
        user: {
          anyOf: [
            { $ref: "#/definitions/User" },
            { $ref: "#/definitions/Admin" },
          ],
        },
        status: {
          enum: ["active", "inactive"],
        },
      },
      required: ["portfolio_ids", "project_id"],
    },
  },
  definitions: {
    User: {
      type: "object",
      properties: {
        firstName: {
          type: "string",
        },
        lastName: {
          type: "string",
        },
        jobTitle: {
          type: "string",
        },
        companyId: {
          type: "string",
        },
      },
      required: [],
    },
  }
}
*/
```

## standalone definition DSL

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
