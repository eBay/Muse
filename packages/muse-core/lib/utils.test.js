const { utils } = require('./');

jest.mock('fs');
jest.mock('fs/promises');
describe('utils basic tests.', () => {
  it('Update json with delta change', async () => {
    const obj = {
      name: 'testobj',
      items: [
        {
          name: 'item1',
          value: 1,
        },
        { name: 'item2', value: 2 },
        'abcd',
      ],
    };

    utils.updateJson(obj, {
      set: [
        {
          path: 'prop.a',
          value: 'a',
        },
        { path: 'prop.b', value: { c: 'c' } },
      ],
      unset: ['name'],
      remove: [
        { path: 'items', value: 'abcd' },
        { path: 'items', value: 1234 },
        { path: 'items', predicate: { name: 'item2' } },
      ],
      push: [
        {
          path: 'prop3.arr',
          value: 1,
        },
      ],
    });

    expect(obj.prop.a).toBe('a');
    expect(obj.prop.b.c).toBe('c');
    expect(obj.name).toBeUndefined();
    expect(obj.items.length).toBe(1);
    expect(obj.items[0].name).toBe('item1');
    expect(obj.prop3.arr[0]).toBe(1);
  });
});
