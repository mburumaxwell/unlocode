import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RAW_DIR = path.join(process.cwd(), 'src/data/raw');
const BASE_URL = 'https://service.unece.org/trade/locode/';

async function releaseExists(baseUrl: string, release: string): Promise<boolean> {
  const fileName = `${release} UNLOCODE CodeListPart1.csv`;
  const url = new URL(encodeURIComponent(fileName), baseUrl).toString();

  try {
    const headResponse = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (headResponse.ok) return true;
    if (headResponse.status !== 405) return false;

    const getResponse = await fetch(url, { redirect: 'follow' });
    return getResponse.ok;
  } catch {
    return false;
  }
}

async function detectLatestRelease(baseUrl: string): Promise<string | undefined> {
  const currentYear = new Date().getUTCFullYear();
  const latestYearToTry = currentYear + 1;
  const earliestYearToTry = currentYear - 15;
  const maxIssueToTry = 4;

  for (let year = latestYearToTry; year >= earliestYearToTry; year -= 1) {
    for (let issue = maxIssueToTry; issue >= 1; issue -= 1) {
      const candidate = `${year}-${issue}`;
      if (await releaseExists(baseUrl, candidate)) return candidate;
    }
  }

  return undefined;
}

async function main() {
  const release = await detectLatestRelease(BASE_URL);

  if (!release) {
    throw new Error('Could not determine latest release from UNECE.');
  }

  const files = [
    `${release} UNLOCODE CodeListPart1.csv`,
    `${release} UNLOCODE CodeListPart2.csv`,
    `${release} UNLOCODE CodeListPart3.csv`,
    `${release} SubdivisionCodes.csv`,
  ];

  await mkdir(RAW_DIR, { recursive: true });

  for (const fileName of files) {
    const url = new URL(encodeURIComponent(fileName), BASE_URL).toString();
    const target = path.join(RAW_DIR, fileName);
    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      throw new Error(`Failed to download ${fileName}: ${response.status} ${response.statusText} (${url})`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(target, buffer);
    console.log(`Downloaded ${fileName} (${buffer.length.toLocaleString()} bytes)`);
  }
  console.log(`Done. Raw files saved to ${RAW_DIR}`);
}

await main();
