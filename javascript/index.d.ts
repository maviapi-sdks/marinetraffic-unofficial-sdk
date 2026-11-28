export declare const DEMO_KEY: string;

export interface ClientOptions {
  /** Your maviapi API key. Default: the MAVIAPI_API_KEY environment variable, then the shared demo key. */
  apiKey?: string;
  baseUrl?: string;
  /** Milliseconds. Default 120000. */
  timeout?: number;
  fetch?: typeof fetch;
}

/** An error status answered by the API. */
export declare class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string);
}

export interface PortsParams {
  /**
   * port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam" or "NLRTM"
   */
  "query"?: string;
  /**
   * Rows in one page, 1 to 200 (default 50)
   */
  "limit"?: number;
  /**
   * Rows to skip before the page starts (default 0)
   */
  "offset"?: number;
  undefined?: string;
  undefined?: string;
  undefined?: string;
}

export interface PortsByPortParams {
  /**
   * UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g. 2036, the port_id of /ports)
   */
  "port": string;
  undefined?: string;
}

export interface PortsVesselsByPortParams {
  /**
   * UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
   */
  "port": string;
  /**
   * search radius around the port position, 0.5 to 15 km
   */
  "radius_km"?: number;
  /**
   * only vessels of this map category (cargo, tanker, passenger, fishing, tug_special,
   * high_speed, pleasure, navigation_aid, unspecified)
   */
  "vessel_type"?: string;
  /**
   * true for only vessels moving at 1 knot or more, false for only vessels stopped or
   * moored
   */
  "moving"?: string;
  /**
   * Rows in one page, 1 to 200 (default 50)
   */
  "limit"?: number;
  /**
   * Rows to skip before the page starts (default 0)
   */
  "offset"?: number;
  undefined?: string;
  undefined?: string;
  undefined?: string;
}

export interface TrackParams {
  /**
   * vessel name, IMO or MMSI (kind=vessel), or port name or UN/LOCODE (kind=port)
   */
  "query"?: string;
  /**
   * what to resolve the text to: vessel or port. One of: vessel, port
   */
  "kind"?: string;
  /**
   * kind=port: how many nearby vessels to include (0 to 50)
   */
  "nearby"?: number;
  undefined?: string;
}

export interface VesselsParams {
  /**
   * vessel name (at least 3 characters), IMO number or MMSI
   */
  "query"?: string;
  /**
   * Rows in one page, 1 to 200 (default 50)
   */
  "limit"?: number;
  /**
   * Rows to skip before the page starts (default 0)
   */
  "offset"?: number;
  undefined?: string;
  undefined?: string;
  undefined?: string;
}

export interface VesselsByImoParams {
  /**
   * 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the `ref` of a list row, for
   * vessels with no IMO)
   */
  "imo": string;
  undefined?: string;
}

export interface VesselsPositionByImoParams {
  /**
   * 7-digit IMO number, 9-digit MMSI, or shipid:<id>
   */
  "imo": string;
  undefined?: string;
}

export declare class MarinetrafficClient {
  constructor(options?: ClientOptions);
  request(path: string, params?: Record<string, unknown>, required?: string[]): Promise<Record<string, any>>;
  /**
   * Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
   * in the site's relevance order (the site returns at most about 12 matches). Each row
   * has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
   * code it matched on.
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   query (string): port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam"
   *     or "NLRTM"
   *   limit (integer): Rows in one page, 1 to 200 (default 50)
   *   offset (integer): Rows to skip before the page starts (default 0)
   *   undefined (string)
   *   undefined (string)
   *   undefined (string)
   */
  ports(params?: PortsParams): Promise<Record<string, any>>;
  /**
   * Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
   * in hours, alternative names, its anchorages, related ports and the site's
   * one-paragraph summary.
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
   *     2036, the port_id of /ports)
   *   undefined (string)
   */
  portsByPort(params: PortsByPortParams): Promise<Record<string, any>>;
  /**
   * Ships currently in or near a port: every vessel the live map shows within radius_km
   * of the port's position, nearest first, including anonymous satellite positions (name
   * "[SAT-AIS]", `ref` null), with position, distance, speed, course, heading, AIS
   * destination, size, deadweight and the age of the position. `complete` is false only
   * if part of the area could not be read; `map_requests` is how many map tiles were
   * read.
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
   *   radius_km (number): search radius around the port position, 0.5 to 15 km
   *   vessel_type (string): only vessels of this map category (cargo, tanker,
   *     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
   *     unspecified)
   *   moving (string): true for only vessels moving at 1 knot or more, false for only
   *     vessels stopped or moored
   *   limit (integer): Rows in one page, 1 to 200 (default 50)
   *   offset (integer): Rows to skip before the page starts (default 0)
   *   undefined (string)
   *   undefined (string)
   *   undefined (string)
   */
  portsVesselsByPort(params: PortsVesselsByPortParams): Promise<Record<string, any>>;
  /**
   * From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact
   * vessel name and returns the vessel's details (`vessel`) and latest position with
   * voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns
   * the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest
   * first). `resolved` says what the text was resolved to. A name matching several
   * vessels or ports is refused as ambiguous, with the candidates listed in the error.
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
   *     UN/LOCODE (kind=port)
   *   kind (string): what to resolve the text to: vessel or port. One of: vessel, port
   *   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
   *   undefined (string)
   */
  track(params?: TrackParams): Promise<Record<string, any>>;
  /**
   * Vessels whose name (current or former), IMO or MMSI matches the text, in the site's
   * relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific
   * vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign,
   * flag, type, market, size class, length and width, plus the name or number it matched
   * on.
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   query (string): vessel name (at least 3 characters), IMO number or MMSI
   *   limit (integer): Rows in one page, 1 to 200 (default 50)
   *   offset (integer): Rows to skip before the page starts (default 0)
   *   undefined (string)
   *   undefined (string)
   *   undefined (string)
   */
  vessels(params?: VesselsParams): Promise<Record<string, any>>;
  /**
   * Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
   * AIS type, commercial market and size class, length and width, AIS class, home port
   * and the site's summary sentence. Build year is not public and is not returned.
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
   *     `ref` of a list row, for vessels with no IMO)
   *   undefined (string)
   */
  vesselsByImo(params: VesselsByImoParams): Promise<Record<string, any>>;
  /**
   * Latest AIS position of one vessel (latitude/longitude, speed in knots, course,
   * heading, rate of turn, draught, navigational status, sea area, report time in UTC
   * and its age, reception type) with its voyage: destination reported over AIS, ETA,
   * progress, departure port and time, arrival port and time (actual once arrived, else
   * estimated).
   *
   * Each successful request uses 5 credits.
   *
   * Parameters:
   *   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
   *   undefined (string)
   */
  vesselsPositionByImo(params: VesselsPositionByImoParams): Promise<Record<string, any>>;
}
