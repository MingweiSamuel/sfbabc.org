import type { APIContext } from "astro";
import { notFound } from "../data";

export async function GET(ctx: APIContext) {
  const COLOR = /[0-9A-F]{6}/i;
  if (!COLOR.test(ctx.params.color!)) {
    return notFound(`"${ctx.params.color}" must be a 6-digit hex code.`);
  }

  const CACHE_TIME_SECS = 7 * 24 * 3600;
  return new Response(`\
<?xml version="1.0" encoding="UTF-8"?>
<svg width="11" height="16" viewBox="-0.5 -0.5 11 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <path d="M 5,0 C 2,0 0,2 0,5 0,9 3,12.5 5,15 7,12.5 10,9 10,5 10,2 8,0 5,0 Z" fill="#${ctx.params.color}" stroke="#000" stroke-width="1" />
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
