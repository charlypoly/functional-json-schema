# functional-json-schema
Build a JSON Schema with functions



**target API for 1.0**

```js

import * as schema from 'functional-json-schema';

const JSONschema = schema.schema({
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
