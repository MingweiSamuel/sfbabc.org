import type { APIContext, GetStaticPaths } from "astro";
import { notFound } from "../data";

export const COLORS = ["444", "555", "666", "777", "888", "999", "aaa", "bbb", "ccc", "ddd", "eee", "fff"];

export const prerender = true;
export const getStaticPaths = (() => {
  return COLORS.map(color => ({
    params: { color },
  }));
}) satisfies GetStaticPaths;

export async function GET(ctx: APIContext) {
  const COLOR = /^[0-9A-F]{3,8}$/i;
  if (!COLOR.test(ctx.params.color!)) {
    return notFound(`"${ctx.params.color}" must be a hex code.`);
  }

  const CACHE_TIME_SECS = 7 * 24 * 3600;
  return new Response(`\
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="10"
   height="10"
   viewBox="-0.5 -0.5 7 11"
   version="1.1"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns="http://www.w3.org/2000/svg">
  <path
     d="M 0,0 6,3 0,6 0,10 Z"
     fill="#${ctx.params.color}" stroke="#000" stroke-width="1" />
</svg>`, {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${CACHE_TIME_SECS}`,
      "Expires": new Date(Date.now() + CACHE_TIME_SECS * 1000).toUTCString(),
    },
  });
}
