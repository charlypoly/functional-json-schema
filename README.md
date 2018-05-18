# functional-json-schema
Build a JSON Schema with functions



**target API for 1.0**

```js

import * as schema from 'functional-json-schema';

const JSONschema = schema.schema({
  person: {
    friends: schema.arrayOf(schema.definition('user')),
    id: 'string*',
    friend_ids: schema.required(schema.arrayOf(schema.definition('User'))),
  }
})

/*

=> {
  properties: {
    person: {
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
