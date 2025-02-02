export interface Site {
  id: number | null,
  act: number | null,
  vta: number | null,
  ggt: number | null,
  muni: number | null,
  lat: number,
  lon: number,
  name: string | null,
  adopted: boolean,
  lines: string[],
  avgWeekdayBoardings: number,
  notes: string[],
  //
  benchStatus: BenchStatus,
  benchLength: number | null,
  benchNickname: string | null,
  benchImageUrl: string | null,
}
export type BenchStatus = 'Good' | 'Replaced' | 'Removed' | 'Destroyed' | 'Proposed' | 'Attention Needed';

export interface News {
  url: string,
  date: Date,
  title: string | null,
  description: string | null,
}

export const SITES: Promise<Site[]> = (async () => {
  const SHEETS_DB_SITES = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWDmQyR76rCXXmwltSZaa_5iCi-z6IOqkfNkjc52e713Rc5kfF7mDZuMxghsp-nJlAdskl-IBBbhzN/pub?gid=633984574&single=true&output=csv";
  const res = await fetch(SHEETS_DB_SITES);
  const [head, ...rows] = parseCsv(await res.text());
  const headIdx = Object.fromEntries(head!.map((col, i) => [col.toUpperCase(), i]));
  return rows.map(row => {
    const id = row[headIdx['SITE ID']!];
    const site: Site = {
      id: (null == id || 0 === id.length) ? null : +id,
      act: +row[headIdx['ACT']!]! || null,
      vta: +row[headIdx['VTA']!]! || null,
      ggt: +row[headIdx['GGT']!]! || null,
      muni: +row[headIdx['MUNI']!]! || null,
      lat: +row[headIdx['LAT']!]!,
      lon: +row[headIdx['LON']!]!,
      name: row[headIdx['STOP NAME']!] || null,
      adopted: !!row[headIdx['ADOPTER']!],
      lines: row[headIdx['LINES']!]!
        .split(',')
        .map(line => line.trim())
        .filter(note => 0 < note.length),
      avgWeekdayBoardings: +row[headIdx['AVG WEEKDAY BOARDINGS']!]!,
      notes: row.slice(headIdx['NOTES']!).filter(note => 0 < note.length),
      benchStatus: row[headIdx['BENCH STATUS']!]! as BenchStatus,
      benchLength: +row[headIdx['LENGTH']!]! || null,
      benchNickname: row[headIdx['NICKNAME']!]! || null,
      benchImageUrl: row[headIdx['IMAGE URL']!]! || null,
    };
    return site;
  })
    .filter(site => site.id || (site.lat && site.lon))
    .sort((a, b) => (10 * b.lat - b.lon) - (10 * a.lat - a.lon));
})();

export const getSite = async (sid: number) =>
  (await SITES).find(site => sid === site.id);

export const NEWS: Promise<News[]> = (async () => {
  const SHEETS_DB_NEWS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWDmQyR76rCXXmwltSZaa_5iCi-z6IOqkfNkjc52e713Rc5kfF7mDZuMxghsp-nJlAdskl-IBBbhzN/pub?gid=6743625&single=true&output=csv";
  const res = await fetch(SHEETS_DB_NEWS);
  const [head, ...rows] = parseCsv(await res.text());
  const headIdx = Object.fromEntries(head!.map((col, i) => [col.toUpperCase(), i]));
  return rows
    .map(row => {
      const news: News = {
        url: row[headIdx['URL']!]!,
        date: new Date(row[headIdx['DATE']!]!),
        title: row[headIdx['TITLE']!] || null,
        description: row[headIdx['DESCRIPTION']!] || null,
      };
      return news;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
})();

export function notFound(msg: string): Response {
  return new Response(msg, {
    status: 404,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}

export function parseCsv(csvText: string): string[][] {
  const CELL_REGEX = /(,|\r?\n|^)("((?:[^"]|"")+)"|[^,\r\n]*)/g;

  const grid = [];
  let row = [];

  let match;
  while ((match = CELL_REGEX.exec(csvText))) {
    const sep = match[1];
    const val = match[3] ? match[3].replace(/""/g, '"') : match[2];

    // Handle newlines (new rows).
    if (',' !== sep) grid.push((row = []));

    row.push(val);
  }
  return grid;
}
