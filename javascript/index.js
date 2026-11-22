// Unofficial MarineTraffic API client for JavaScript and TypeScript.
// Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic

export const DEMO_KEY = "mvk_test_playground_5f3c1a8d";

/** An error status answered by the API. */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(`${status} ${code}: ${message}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class MarinetrafficClient {
  /**
   * With no apiKey it uses the MAVIAPI_API_KEY environment variable, then the
   * shared demo key.
   */
  constructor({ apiKey, baseUrl, timeout = 120_000, fetch: fetcher } = {}) {
    const env = globalThis.process?.env ?? {};
    this.apiKey = apiKey || env.MAVIAPI_API_KEY || DEMO_KEY;
    let root = baseUrl || env.MAVIAPI_BASE_URL || "https://api.maviapi.com";
    while (root.endsWith("/")) root = root.slice(0, -1);
    this.baseUrl = root + "/v1/sites/marinetraffic";
    this.timeout = timeout;
    this.fetch = fetcher ?? ((...args) => globalThis.fetch(...args));
  }

  /**
   * Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
   * UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
   * has no paging.
   *
   * Each successful request uses 10 credits for every 12 rows it returns (at least 10
   * credits).
   */
  ports(params) {
    return this.request("/ports", params, ["query"]);
  }

  /**
   * Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
   * other names and its anchorages.
   *
   * Each successful request uses 10 credits.
   */
  portsPort(params) {
    return this.request("/ports/{port}", params, ["port"]);
  }

  /**
   * Ships currently in or near a port: every vessel the live map shows within radius_km
   * of the port's position, nearest first, with position, speed, course, destination and
   * size. `complete` is false only if part of the area could not be read.
   *
   * Each successful request uses 10 credits.
   */
  portsPortVessels(params) {
    return this.request("/ports/{port}/vessels", params, ["port"]);
  }

  /**
   * One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
   * exact vessel name and returns its details and latest position. kind=port: resolves a
   * UN/LOCODE or exact port name and returns its details and the nearest vessels within
   * 5 km. An ambiguous name answers 400 with candidates.
   *
   * Each successful request uses 10 credits.
   */
  track(params) {
    return this.request("/track", params, ["query"]);
  }

  /**
   * Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
   * call sign, flag, type, size). The site returns at most 12 matches per query and has
   * no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.
   *
   * Each successful request uses 10 credits for every 12 rows it returns (at least 10
   * credits).
   */
  vessels(params) {
    return this.request("/vessels", params, ["query"]);
  }

  /**
   * Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
   * market and size class, length and width. Build year is not public on the site (login
   * only) and is not returned.
   *
   * Each successful request uses 10 credits.
   */
  vesselsImo(params) {
    return this.request("/vessels/{imo}", params, ["imo"]);
  }

  /**
   * Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
   * status, time of report) with its voyage: reported destination, ETA, departure and
   * arrival ports.
   *
   * Each successful request uses 10 credits.
   */
  vesselsImoPosition(params) {
    return this.request("/vessels/{imo}/position", params, ["imo"]);
  }

  /** GET one endpoint path. Parameters named in the path go there, the rest in the query. */
  async request(path, params = {}, required = []) {
    for (const name of required) {
      if (params[name] == null) throw new TypeError(`Missing required parameter: ${name}`);
    }
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value == null) continue;
      const token = `{${name}}`;
      if (path.includes(token)) path = path.replace(token, encodeURIComponent(String(value)));
      else query.set(name, String(value));
    }
    const search = query.toString();
    const response = await this.fetch(this.baseUrl + path + (search ? `?${search}` : ""), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        "User-Agent": "marinetraffic-unofficial-sdk/0.1.0 (javascript)",
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {}
    if (!response.ok) {
      throw new ApiError(response.status, body?.error ?? "http_error", body?.message ?? text.slice(0, 200));
    }
    return body;
  }
}
