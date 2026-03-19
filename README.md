# unlocode

`unlocode` aims to make official UNECE UN/LOCODE data easy to use in real applications by providing a clean search experience, a simple public API, and reusable React UI primitives, while keeping the dataset refresh process automated and transparent.

Use the live site for the full experience, docs, and API reference: [unlocode.vercel.app](https://unlocode.vercel.app).

## What You Get

- Search UI for UN/LOCODE entries (country, function, and text filters)
- Public REST API for search, lookup, and dataset metadata
- Reusable React component (`UnlocodeInput`) for forms
- Data pipeline scripts to download and convert official UNECE CSV files

## Local Development

Use the Node version from [`.nvmrc`](./.nvmrc) before installing dependencies or running scripts:

```bash
nvm use
corepack enable
pnpm install
pnpm dev
```

Common commands:

```bash
pnpm lint
pnpm test
pnpm data:refresh
```

## Data Refresh

The dataset is generated from official UNECE source files.

```bash
pnpm data:download
pnpm data:convert
```

Or run both in sequence:

```bash
pnpm data:refresh
```
