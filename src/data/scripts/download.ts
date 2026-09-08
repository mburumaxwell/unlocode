/**
 * Downloads the latest UN/LOCODE release from UNECE's vocab-locode project on the UNICC GitLab
 * (https://opensource.unicc.org/un/unece/uncefact/vocab-locode). Each release there publishes a
 * data archive holding the official CSV code list. UNECE's classic download host sits behind a
 * browser challenge that blocks non-interactive clients, so it cannot be used from automation.
 *
 * Extracts the CSV files from the archive into src/data/raw/ under release-prefixed names,
 * e.g. "2025-1 UNLOCODE CodeListPart1.csv", replacing whatever was there before.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { unzipSync } from 'fflate';

const RAW_DIR = path.join(process.cwd(), 'src/data/raw');
const PROJECT_URL = 'https://opensource.unicc.org/un/unece/uncefact/vocab-locode';
const PROJECT_API_URL = 'https://opensource.unicc.org/api/v4/projects/un%2Funece%2Funcefact%2Fvocab-locode';
const RELEASE_PATTERN = /^(\d{4})-(\d)$/; // e.g. "2025-1"; older tags ("v2023-2") have no archive

type GitLabRelease = { tag_name: string; assets: { links: { name: string; url: string }[] } };

/** Finds the newest release tagged as a UN/LOCODE issue and the URL of its data archive. */
async function findLatestRelease(): Promise<{ release: string; archiveUrl: string }> {
  const url = `${PROJECT_API_URL}/releases?per_page=20`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to list releases: ${response.status} ${response.statusText} (${url})`);
  }

  const releases = (await response.json()) as GitLabRelease[];
  const candidates = releases.flatMap((release) => {
    const match = release.tag_name.match(RELEASE_PATTERN);
    return match ? [{ release, year: Number(match[1]), issue: Number(match[2]) }] : [];
  });
  candidates.sort((a, b) => b.year - a.year || b.issue - a.issue);

  const latest = candidates[0]?.release;
  if (!latest) throw new Error(`No UN/LOCODE release found at ${PROJECT_URL}`);

  // Prefer the link the release advertises; fall back to the CI job artifact by convention.
  const archiveUrl =
    latest.assets.links.find((link) => link.url.includes('job=package-release'))?.url ??
    `${PROJECT_URL}/-/jobs/artifacts/${latest.tag_name}/download?job=package-release`;
  return { release: latest.tag_name, archiveUrl };
}

async function main() {
  const { release, archiveUrl } = await findLatestRelease();
  console.log(`Latest release: ${release}`);

  const response = await fetch(archiveUrl, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download archive: ${response.status} ${response.statusText} (${archiveUrl})`);
  }
  const archive = new Uint8Array(await response.arrayBuffer());
  console.log(`Downloaded archive (${archive.byteLength.toLocaleString()} bytes)`);

  // Only the CSV files are needed; the archive also carries the MDB, TXT, XML and Turtle editions.
  const files = unzipSync(archive, {
    filter: (file) => file.name.startsWith('release/csv/') && file.name.endsWith('.csv'),
  });
  if (Object.keys(files).length === 0) throw new Error(`No CSV files found in ${archiveUrl}`);

  await rm(RAW_DIR, { recursive: true, force: true });
  await mkdir(RAW_DIR, { recursive: true });

  for (const [entryName, content] of Object.entries(files)) {
    const fileName = `${release} ${path.basename(entryName)}`;
    await writeFile(path.join(RAW_DIR, fileName), content);
    console.log(`Extracted ${fileName} (${content.byteLength.toLocaleString()} bytes)`);
  }
  console.log(`Done. Raw files saved to ${RAW_DIR}`);
}

await main();
