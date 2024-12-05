export interface Site {
  id: number | null,
  act: number | null,
  ggt: number | null,
  muni: number | null,
  lat: number,
  lon: number,
  name: string | null,
  revGeocode: string | null,
  city: string,
  lines: string[],
  adopter: string | null,
  notes: string[],
  //
  benchStatus: BenchStatus,
  benchLength: number | null,
  benchBuilder: string | null,
  benchNickname: string | null,
  benchImageUrl: string | null,
}
export type BenchStatus = 'Good' | 'Replaced' | 'Removed' | 'Destroyed' | 'Proposed';

export const SITES: Promise<Site[]> = (async () => {
  const SHEETS_DB_SITES = "https://script.google.com/macros/s/AKfycbxj3hB_ZN5vzvXtMSNzprA9FHiK26Yc6_b9--n2V_W_mTIV9QvV3XLQW8J5o0njB3ihmQ/exec";
  const res = await fetch(SHEETS_DB_SITES);
  const arr = await res.json<string[][]>();
  const [head, ...rows] = arr;
  const headIdx = Object.fromEntries(head!.map((col, i) => [col.toUpperCase(), i]));
  return rows.map(row => {
    const id = row[headIdx['SITE ID']!];
    const site: Site = {
      id: (null == id || 0 === id.length) ? null : +id,
      act: +row[headIdx['ACT']!]! || null,
      ggt: +row[headIdx['GGT']!]! || null,
      muni: +row[headIdx['MUNI']!]! || null,
      lat: +row[headIdx['LAT']!]!,
      lon: +row[headIdx['LON']!]!,
      name: row[headIdx['STOP NAME']!] || null,
      revGeocode: row[headIdx['REVERSE GEOCODE']!] || null,
      city: row[headIdx['CITY']!]!,
      lines: row[headIdx['LINES']!]!
        .split(',')
        .map(line => line.trim())
        .filter(note => 0 < note.length),
      adopter: row[headIdx['ADOPTER']!]! || null,
      notes: row.slice(headIdx['NOTES']!).filter(note => 0 < note.length),
      benchStatus: row[headIdx['BENCH STATUS']!]! as BenchStatus,
      benchLength: +row[headIdx['LENGTH']!]! || null,
      benchBuilder: row[headIdx['BUILDER']!]! || null,
      benchNickname: row[headIdx['NICKNAME']!]! || null,
      benchImageUrl: row[headIdx['IMAGE URL']!]! || null,
    };
    return site;
  })
    .filter(site => site.id || (site.lat && site.lon));
})();

export const getSite = async (sid: number) =>
  (await SITES).find(site => sid === site.id);


export function notFound(msg: string): Response {
  return new Response(msg, {
    status: 404,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}
