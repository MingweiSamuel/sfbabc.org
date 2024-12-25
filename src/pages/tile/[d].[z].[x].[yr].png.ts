import type { APIContext } from "astro";
import { notFound } from "../../data";

export const MAX_ZOOM = 17;

export const MIN_LAT = 37.2;
export const MAX_LAT = 38.2;
export const MIN_LON = -122.7;
export const MAX_LON = -121.7;

export const MAX_BOUNDS: [[number, number], [number, number]] = [
  [MIN_LAT, MIN_LON],
  [MAX_LAT, MAX_LON],
];

export async function GET(ctx: APIContext) {
  const NUMERIC = /^[0-9]+$/;

  const { d, z, x, yr } = ctx.params;
  const [y, r] = yr!.split('@');

  if (!['l', 'd'].includes(d!)) {
    return notFound(`"${d}" must be one either "l" or "d".`);
  }
  if (!(NUMERIC.test(z!) && NUMERIC.test(x!) && NUMERIC.test(y!))) {
    return notFound(`"${z}", "${x}", "${y}" must be integers.`);
  }
  if (null != r && '2x' !== r) {
    return notFound(`"${r}" must be "2x" or not supplied.`);
  }
  const vals = {
    z: +z!,
    x: +x!,
    y: +y!,
    r: r ? `@${r}` : "", // "" or "@2x".
  };

  if (MAX_ZOOM < vals.z) {
    return notFound(`"${z}" must be no greater than ${MAX_ZOOM}.`);
  }

  {
    // Restrict close zooms.
    if (9 < vals.z) {
      // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Pseudo-code

      const n = 1 << vals.z;
      const minLon = vals.x / n * 360 - 180;
      const maxLon = (vals.x + 1) / n * 360 - 180;

      const minLatRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (vals.y + 1) / n)));
      const minLat = minLatRad * 180 / Math.PI;
      const maxLatRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * vals.y / n)));
      const maxLat = maxLatRad * 180 / Math.PI;

      const lonOverlap = MIN_LON <= maxLon && minLon <= MAX_LON;
      const latOverlap = MIN_LAT <= maxLat && minLat <= MAX_LAT;

      if (!lonOverlap || !latOverlap) {
        return notFound(`Tile (lat, lon) min (${minLat}, ${minLon}) to max (${maxLat}, ${maxLon}) outside of range (${MIN_LAT}, ${MIN_LON}) to (${MAX_LAT}, ${MAX_LON})`);
      }
    }
  }

  const URL = 'l' === d ? ctx.locals.runtime.env.MAP_URL_LIGHT : ctx.locals.runtime.env.MAP_URL_DARK;
  const reqUrl = URL.replace(/\{([a-z]+)\}/g, (_match: string, key: keyof typeof vals) => vals[key]);

  const response = await fetch(reqUrl);

  const newHeaders = new Headers(response.headers);
  const CACHE_TIME_SECS = 30 * 24 * 3600; // 30 days.
  newHeaders.set('Cache-Control', `public, max-age=${CACHE_TIME_SECS}`);
  newHeaders.set('Expires', new Date(Date.now() + CACHE_TIME_SECS * 1000).toUTCString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
