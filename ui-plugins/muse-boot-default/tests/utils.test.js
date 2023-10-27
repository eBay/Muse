import { joinPath, getPluginId } from '../src/utils';

describe('utils', () => {
  it('should join two paths', () => {
    const p1 = '/path/to/';
    const p2 = 'file.txt';
    const result = joinPath(p1, p2);
    expect(result).toBe('/path/to/file.txt');
  });

  it('should handle trailing slash in first path', () => {
    const p1 = '/path/to';
    const p2 = 'file.txt';
    const result = joinPath(p1, p2);
    expect(result).toBe('/path/to/file.txt');
  });

  it('should handle leading slash in second path', () => {
    const p1 = '/path/to/';
    const p2 = '/file.txt';
    const result = joinPath(p1, p2);
    expect(result).toBe('/path/to/file.txt');
  });

  it('should return plugin name', () => {
    const name = 'my-plugin';
    const result = getPluginId(name);
    expect(result).toBe(name);
  });

  it('should return scoped plugin name', () => {
    const name = '@my-scope/my-plugin';
    const result = getPluginId(name);
    expect(result).toBe('@my-scope.my-plugin');
  });
});
