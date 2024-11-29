export interface Site {
    id: string,
    act: number | null,
    ggt: number | null,
    muni: number | null,
    lat: number,
    lon: number,
    revGeocode: string,
    city: string,
    lines: string[],
    adopter: string | null,
    notes: string[],
}

export const SITES: Promise<Site[]> = (async () => {
    const SHEETS_DB_SITES = "https://script.google.com/macros/s/AKfycbxj3hB_ZN5vzvXtMSNzprA9FHiK26Yc6_b9--n2V_W_mTIV9QvV3XLQW8J5o0njB3ihmQ/exec";
    const res = await fetch(SHEETS_DB_SITES);
    const arr = await res.json<string[][]>();
    const [head, ...rows] = arr;
    const headIdx = Object.fromEntries(head!.map((col, i) => [col.toUpperCase(), i]));
    return rows.map(row => {
        const site: Site = {
            id: row[headIdx['SITE ID']!]!,
            act: +row[headIdx['ACT']!]! || null,
            ggt: +row[headIdx['GGT']!]! || null,
            muni: +row[headIdx['MUNI']!]! || null,
            lat: +row[headIdx['LAT']!]!,
            lon: +row[headIdx['LON']!]!,
            revGeocode: row[headIdx['REVERSE GEOCODE']!]!,
            city: row[headIdx['CITY']!]!,
            lines: row[headIdx['LINES']!]!.split(','),
            adopter: row[headIdx['ADOPTER']!]! || null,
            notes: row.slice(headIdx['NOTES']!),
        };
        return site;
    })
    .filter(site => !!site.id);
})();

export const getSite = async (sid: string) =>
    (await SITES).find(site => sid === site.id);
