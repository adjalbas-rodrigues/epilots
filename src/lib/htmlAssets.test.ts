import { describe, it, expect } from 'vitest';
import { rewriteAssetUrls } from './htmlAssets';

describe('rewriteAssetUrls', () => {
  const API = 'https://api.example.com';

  it('returns input unchanged when no img tags', () => {
    expect(rewriteAssetUrls('<p>hello</p>', API)).toBe('<p>hello</p>');
  });

  it('rewrites a relative /materialpublico path with double quotes', () => {
    const input = '<img src="/materialpublico/anexos/x.png" />';
    expect(rewriteAssetUrls(input, API)).toBe(
      '<img src="https://api.example.com/materialpublico/anexos/x.png" />'
    );
  });

  it('rewrites a relative path with single quotes', () => {
    const input = "<img src='/materialpublico/anexos/x.png' />";
    expect(rewriteAssetUrls(input, API)).toBe(
      "<img src='https://api.example.com/materialpublico/anexos/x.png' />"
    );
  });

  it('rewrites multiple imgs in the same string', () => {
    const input = '<img src="/materialpublico/a.png"><img src="/materialpublico/b.png">';
    const out = rewriteAssetUrls(input, API);
    expect(out).toContain('https://api.example.com/materialpublico/a.png');
    expect(out).toContain('https://api.example.com/materialpublico/b.png');
  });

  it('does not touch absolute http/https urls', () => {
    const input = '<img src="https://cdn.example.com/x.png" />';
    expect(rewriteAssetUrls(input, API)).toBe(input);
  });

  it('does not touch protocol-relative urls', () => {
    const input = '<img src="//cdn.example.com/x.png" />';
    expect(rewriteAssetUrls(input, API)).toBe(input);
  });

  it('does not touch data: urls', () => {
    const input = '<img src="data:image/png;base64,iVBORw0KGgoAA" />';
    expect(rewriteAssetUrls(input, API)).toBe(input);
  });

  it('strips trailing slash on api base before joining', () => {
    const input = '<img src="/materialpublico/x.png" />';
    expect(rewriteAssetUrls(input, 'https://api.example.com/')).toContain(
      'https://api.example.com/materialpublico/x.png'
    );
    expect(rewriteAssetUrls(input, 'https://api.example.com/')).not.toContain(
      'com//materialpublico'
    );
  });

  it('handles null/undefined gracefully', () => {
    expect(rewriteAssetUrls(null as any, API)).toBe(null);
    expect(rewriteAssetUrls(undefined as any, API)).toBe(undefined);
    expect(rewriteAssetUrls('', API)).toBe('');
  });

  it('returns input untouched when api base is empty', () => {
    const input = '<img src="/materialpublico/x.png" />';
    expect(rewriteAssetUrls(input, '')).toBe(input);
  });
});
