const FONT_STYLESHEETS = [
  'https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css',
];

// SUITE's own stylesheet has no font-display, which hides headings until the 500KB file arrives.
const SUITE_FONT_FACE = `@font-face {
  font-family: 'SUITE Variable';
  font-weight: 300 900;
  font-display: swap;
  src: url('https://cdn.jsdelivr.net/gh/sun-typeface/SUITE@2.0.4/fonts/variable/woff2/SUITE-Variable.woff2') format('woff2-variations');
}`;

// The link-tree's global body background is a beige gradient; this page needs a plain white canvas.
const PAGE_BACKGROUND = 'html:has([data-os-root]), html:has([data-os-root]) body { background: #ffffff; }';

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {FONT_STYLESHEETS.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      <style>{`${SUITE_FONT_FACE}\n${PAGE_BACKGROUND}`}</style>
      {children}
    </>
  );
}
