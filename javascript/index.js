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
   * Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
   * in the site's relevance order (the site returns at most about 12 matches). Each row
   * has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
   * code it matched on.
   *
   * Each successful request uses 5 credits.
   */
  ports(params = {}) {
    return this.request("/ports", params, []);
  }

  /**
   * Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
   * in hours, alternative names, its anchorages, related ports and the site's
   * one-paragraph summary.
   *
   * Each successful request uses 5 credits.
   */
  portsByPort(params) {
    return this.request("/ports/{port}", params, ["port"]);
  }

  /**
   * Ships currently in or near a port: every identified vessel the live map shows within
   * radius_km of the port's position (anonymous [SAT-AIS] placeholders left out),
   * nearest first, with position, distance, speed, course, heading, AIS destination,
   * size, deadweight and the age of the position. `complete` is false only if part of
   * the area could not be read; `map_requests` is how many map tiles were read.
   *
   * Each successful request uses 5 credits.
   */
  portsVesselsByPort(params) {
    return this.request("/ports/{port}/vessels", params, ["port"]);
  }

  /**
   * From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact
   * vessel name and returns the vessel's details (`vessel`) and latest position with
   * voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns
   * the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest
   * first). `resolved` says what the text was resolved to. A name matching several
   * vessels or ports is refused as ambiguous, with the candidates listed in the error.
   *
   * Each successful request uses 5 credits.
   */
  track(params = {}) {
    return this.request("/track", params, []);
  }

  /**
   * Vessels whose name (current or former), IMO or MMSI matches the text, in the site's
   * relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific
   * vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign,
   * flag, type, market, size class, length and width, plus the name or number it matched
   * on.
   *
   * Each successful request uses 5 credits.
   */
  vessels(params = {}) {
    return this.request("/vessels", params, []);
  }

  /**
   * Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
   * AIS type, commercial market and size class, length and width, AIS class, home port
   * and the site's summary sentence. Build year is not public and is not returned.
   *
   * Each successful request uses 5 credits.
   */
  vesselsByImo(params) {
    return this.request("/vessels/{imo}", params, ["imo"]);
  }

  /**
   * Latest AIS position of one vessel (latitude/longitude, speed in knots, course,
   * heading, rate of turn, draught, navigational status, sea area, report time in UTC
   * and its age, reception type) with its voyage: destination reported over AIS, ETA,
   * progress, departure port and time, arrival port and time (actual once arrived, else
   * estimated).
   *
   * Each successful request uses 5 credits.
   */
  vesselsPositionByImo(params) {
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
