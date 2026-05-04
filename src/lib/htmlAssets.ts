/**
 * Rewrites relative image srcs (e.g. /materialpublico/anexos/x.png) in HTML
 * strings so they point at the API server, where the assets live.
 *
 * - Absolute URLs (http://, https://, //, data:) are left untouched.
 * - Empty/nullish input is returned as-is.
 * - Empty apiBase returns input unchanged.
 *
 * @param html  HTML string from the API (e.g. choice.description, statement)
 * @param apiBase  Base URL of the API (typically `process.env.NEXT_PUBLIC_API_URL`)
 */
export function rewriteAssetUrls(html: string | null | undefined, apiBase: string): any {
  if (html == null || html === '') return html;
  if (!apiBase) return html;

  const base = apiBase.replace(/\/+$/, ''); // strip trailing slash

  // Match src="/path" or src='/path' where /path doesn't start with //, http://, https:// or data:
  return html.replace(
    /(src\s*=\s*)(['"])(\/(?!\/)[^'"]*?)\2/gi,
    (_match, attr, quote, path) => `${attr}${quote}${base}${path}${quote}`
  );
}

/**
 * Convenience for question/choice HTML — uses NEXT_PUBLIC_LEGACY_ASSETS_URL
 * (the legacy CakePHP host where /materialpublico/* images live).
 * Defaults to https://academico.cursoh.com.br since that's where the
 * existing question images are served from.
 *
 * After migrating images into our backend volume, set the env var to
 * NEXT_PUBLIC_LEGACY_ASSETS_URL=https://api.elitepilots.info to serve
 * from our infrastructure.
 */
export function rewriteHtmlForRender(html: string | null | undefined): any {
  const legacy = process.env.NEXT_PUBLIC_LEGACY_ASSETS_URL || 'https://academico.cursoh.com.br';
  return rewriteAssetUrls(html, legacy);
}

/**
 * Normalizes a chunk of legacy HTML (statement, choice, explanation):
 * - if the string already looks like HTML, leave structure alone
 * - otherwise convert \n -> <br /> and \t -> 4 nbsps
 * - then rewrite any /materialpublico/ or /imagemsite/ relative img srcs
 *   to point at the configured asset host.
 */
export function normalizeLegacyHtml(input: string | null | undefined): string {
  if (input == null || input === '') return ''
  const html =
    input.includes('<') && input.includes('>')
      ? input
      : input.replace(/\n/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
  return rewriteHtmlForRender(html) || ''
}
