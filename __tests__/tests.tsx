import { schema, types } from '../lib/index';


describe('types', () => {
    test('arrayOf()', () => {
        expect(
            types.arrayOf(types.type('string'))
        ).toEqual({
            "required": false,
            "type": {
                "items": { "type": "string" },
                "type": "array"
            }
        });
    });
});
