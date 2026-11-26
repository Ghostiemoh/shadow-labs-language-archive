// Finds an openly licensed photo on iNaturalist for every concept that has a `taxon`.
// Keeps only licenses that allow commercial reuse (CC0, CC BY, CC BY-SA) and saves
// license, source and credit with each photo. Output: data/images.json
//
//   node scripts/fetch-inat-photos.mjs
import { readFile, writeFile } from "node:fs/promises";

const OK = { cc0: "CC0 1.0", "cc-by": "CC BY 4.0", "cc-by-sa": "CC BY-SA 4.0" };
const LICENSE_URL = {
  cc0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
};
const decode = (t) => (t || "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const who = (attr) => {
  const a = decode(attr);
  const m = a.match(/^\(c\)\s*([^,]+)/i) || a.match(/uploaded by (.+)$/i);
  return (m ? m[1] : a).trim() || "anonymous";
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": "nigerian-language-archive/0.1" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

const { concepts } = JSON.parse(await readFile(new URL("../data/concepts.json", import.meta.url)));
const out = {};
for (const c of concepts.filter((c) => c.taxon)) {
  try {
    const search = await get(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(c.taxon)}&per_page=1`);
    const taxon = search.results[0];
    if (!taxon) { console.log("no taxon", c.slug); continue; }
    await sleep(1100);
    const full = (await get(`https://api.inaturalist.org/v1/taxa/${taxon.id}`)).results[0];
    const photos = (full.taxon_photos || []).map((tp) => tp.photo);
    let photo = photos.find((p) => OK[p.license_code]);
    if (!photo) {
      // Fall back to research-grade observations with a reusable photo license.
      await sleep(1100);
      const obs = await get(`https://api.inaturalist.org/v1/observations?taxon_id=${taxon.id}&photo_license=cc0,cc-by,cc-by-sa&quality_grade=research&order_by=votes&per_page=5`);
      photo = obs.results.flatMap((o) => o.photos || []).find((p) => OK[p.license_code]);
    }
    if (!photo) { console.log("no reusable photo", c.slug); continue; }
    const big = (photo.medium_url || photo.url).replace(/\/(square|small|medium)\./, "/large.");
    out[c.slug] = {
      url: big,
      license: OK[photo.license_code],
      license_url: LICENSE_URL[photo.license_code],
      source_url: `https://www.inaturalist.org/photos/${photo.id}`,
      creator: who(photo.attribution),
      credit: `Photo: ${who(photo.attribution)}, ${OK[photo.license_code]}, via iNaturalist`,
    };
    console.log("ok", c.slug, out[c.slug].license);
    await sleep(1100);
  } catch (e) {
    console.log("error", c.slug, e.message);
  }
}
await writeFile(new URL("../data/images.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`saved ${Object.keys(out).length} photos`);
