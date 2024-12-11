const REPORT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeQPKKgqx_tR4Yp9kNynRpriRlsPerugbziuBVWjTHAdff_Kw/viewform";
const REQUEST_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeoh_bZOndFPvSpkW468EsgudlD8OeXM2h7TpL_yCX9HKjH3A/viewform";

export const reportForm = (loc?: string | null, siteId?: number | null) => {
    const url = new URL(REPORT_FORM_URL);
    if (null != loc) url.searchParams.append('entry.1051599017', loc);
    if (null != siteId) url.searchParams.append('entry.757375298', `${siteId}`);
    return url.toString();
};

export const requestForm = (loc?: string | null) => {
    const url = new URL(REQUEST_FORM_URL);
    if (null != loc) url.searchParams.append('entry.1000004130', loc);
    return url.toString();
};
