import { schema, types, constraints } from '../lib/index';
import * as ajv from 'ajv';


describe('types', () => {

    test('sample', () => {
        const generated = schema({
            community_list: {
                portfolio_ids: types.arrayOf('string', { required: true }),
                project_id: types.type('string', { required: true }),
                status: types.enumOf('string'),
                user: types.anyOf(
                    types.definition('User'),
                    types.definition('Admin'),
                )
            }
        });
        expect(generated).toEqual({
            type: 'object',
            properties: {
                community_list: {
                    type: 'object',
                    properties: {
                        portfolio_ids: {
                            'type': 'array',
                            'items': {
                                'type': 'string'
                            }
                        },
                        project_id: {
                            'type': 'string'
                        },
                        user: {
                            anyOf: [
                                { $ref: '#/definitions/User' },
                                { $ref: '#/definitions/Admin' }
                            ]
                        },
                        status: {
                            enum: [
                                { type: 'string' }
                            ]
                        }
                    },
                    required: ['portfolio_ids', 'project_id']
                }
            }
        });
        const validator = new ajv();
        expect(validator.validateSchema(generated)).toBe(true);
    });

});
