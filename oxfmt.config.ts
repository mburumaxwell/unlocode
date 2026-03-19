import { defineConfig } from 'oxfmt';

export default defineConfig({
  useTabs: false,
  printWidth: 120,
  singleQuote: true,
  jsxSingleQuote: true,
  quoteProps: 'consistent',
  ignorePatterns: [
    // everything in .gitignore is ignored by default
    // no need to repeat it here

    // agent skills (imported via npx skills and diff checked)
    '.agents/skills',

    // static files
    'public',
    'static',

    // shadcn components (generated and diff checked)
    'src/components/ui',

    // special files
    '.vscode/settings.json',
    'package.json',
    'src/data/data.json',
    'src/data/raw',
  ],
  sortImports: {},
  sortTailwindcss: {
    stylesheet: 'src/app/globals.css',
    functions: ['clsx', 'cn'],
    preserveWhitespace: true,
  },
});
