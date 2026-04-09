# unlocode

`unlocode` aims to make official UNECE UN/LOCODE data easy to use in real applications by providing a clean search experience, a simple public API, and reusable React UI primitives, while keeping the dataset refresh process automated and transparent.

Use the live site for the full experience, docs, and API reference: [unlocode.vercel.app](https://unlocode.vercel.app).

## What You Get

- Search UI for UN/LOCODE entries (country, function, and text filters)
- Public REST API for search, lookup, and dataset metadata
- Reusable React component (`UnlocodeInput`) for forms
- Data pipeline scripts to download and convert official UNECE CSV files

## Local setup

Use the Node version from [`.nvmrc`](./.nvmrc) before installing dependencies or running scripts:

```bash
nvm use
corepack enable
pnpm install
```

### Run the app

```bash
pnpm dev
```

Default local URL:

- `https://unlocode.localhost`

### Bypass portless

```bash
pnpm next dev
```

### First-run HTTPS trust

If your browser shows a certificate warning:

```bash
pnpm exec portless trust
```

### Safari hostname resolution

If Safari cannot resolve `.localhost` subdomains:

```bash
pnpm exec portless hosts sync
```

To remove those entries later:

```bash
pnpm exec portless hosts clean
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
