import { schema, types, constraints } from '../lib/index';


describe('types', () => {

    test('sample', () => {
        expect(schema({
            community_list: {
                portfolio_ids: types.arrayOf('string', { required: true }),
                project_id: types.type('string', { required: true })
            }
        })).toEqual({
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
                        }
                    },
                    required: ['portfolio_ids', 'project_id']
                }
            }
        });
    });

});
