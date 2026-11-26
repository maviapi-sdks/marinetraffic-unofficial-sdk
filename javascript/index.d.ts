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
   * Port name (at least 3 characters) or UN/LOCODE
   */
  "query": string;
  /**
   * Rows per page (default 50, max 200)
   */
  "limit"?: number;
  /**
   * Rows to skip
   */
  "offset"?: number;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export interface PortsByPortParams {
  /**
   * UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g. 2036, the port_id of /ports)
   */
  "port": string;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export interface PortsVesselsByPortParams {
  /**
   * UN/LOCODE or MarineTraffic port id
   */
  "port": string;
  /**
   * Search radius around the port position, 0.5 to 15 km
   */
  "radius_km"?: number;
  /**
   * Only vessels of this map category. One of: cargo, tanker, passenger, fishing,
   * tug_special, high_speed, pleasure, navigation_aid, unspecified
   */
  "vessel_type"?: string;
  /**
   * true: only vessels moving at 1 knot or more; false: only vessels stopped or moored
   */
  "moving"?: boolean;
  /**
   * Rows per page (default 50, max 200)
   */
  "limit"?: number;
  /**
   * Rows to skip
   */
  "offset"?: number;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export interface TrackParams {
  /**
   * Vessel name/IMO/MMSI, or port name/UN/LOCODE
   */
  "query": string;
  /**
   * What to resolve the text to. One of: vessel, port
   */
  "kind"?: string;
  /**
   * kind=port: how many nearby vessels to include (0 to 50)
   */
  "nearby"?: number;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export interface VesselsParams {
  /**
   * Vessel name (at least 3 characters), IMO number or MMSI
   */
  "query": string;
  /**
   * Rows per page (default 50, max 200)
   */
  "limit"?: number;
  /**
   * Rows to skip
   */
  "offset"?: number;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export interface VesselsByImoParams {
  /**
   * 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the `ref` of a list row, for
   * vessels with no IMO)
   */
  "imo": string;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export interface VesselsPositionByImoParams {
  /**
   * 7-digit IMO number, 9-digit MMSI, or shipid:<id>
   */
  "imo": string;
  /**
   * Bypass and repopulate the cache (answers are cached for 5 minutes)
   */
  "refresh"?: boolean;
}

export declare class MarinetrafficClient {
  constructor(options?: ClientOptions);
  request(path: string, params?: Record<string, unknown>, required?: string[]): Promise<Record<string, any>>;
  /**
   * Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
   * UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
   * has no paging.
   *
   * Each successful request uses 10 credits for every 12 rows it returns (at least 10
   * credits).
   *
   * Parameters:
   *   query (string, required): Port name (at least 3 characters) or UN/LOCODE
   *   limit (integer): Rows per page (default 50, max 200)
   *   offset (integer): Rows to skip
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  ports(params: PortsParams): Promise<Record<string, any>>;
  /**
   * Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
   * other names and its anchorages.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
   *     2036, the port_id of /ports)
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  portsByPort(params: PortsByPortParams): Promise<Record<string, any>>;
  /**
   * Ships currently in or near a port: every vessel the live map shows within radius_km
   * of the port's position, nearest first, with position, speed, course, destination and
   * size. `complete` is false only if part of the area could not be read.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   port (string, required): UN/LOCODE or MarineTraffic port id
   *   radius_km (number): Search radius around the port position, 0.5 to 15 km
   *   vessel_type (string): Only vessels of this map category. One of: cargo, tanker,
   *     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
   *     unspecified
   *   moving (boolean): true: only vessels moving at 1 knot or more; false: only
   *     vessels stopped or moored
   *   limit (integer): Rows per page (default 50, max 200)
   *   offset (integer): Rows to skip
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  portsVesselsByPort(params: PortsVesselsByPortParams): Promise<Record<string, any>>;
  /**
   * One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
   * exact vessel name and returns its details and latest position. kind=port: resolves a
   * UN/LOCODE or exact port name and returns its details and the nearest vessels within
   * 5 km. An ambiguous name answers 400 with candidates.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
   *   kind (string): What to resolve the text to. One of: vessel, port
   *   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  track(params: TrackParams): Promise<Record<string, any>>;
  /**
   * Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
   * call sign, flag, type, size). The site returns at most 12 matches per query and has
   * no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.
   *
   * Each successful request uses 10 credits for every 12 rows it returns (at least 10
   * credits).
   *
   * Parameters:
   *   query (string, required): Vessel name (at least 3 characters), IMO number or
   *     MMSI
   *   limit (integer): Rows per page (default 50, max 200)
   *   offset (integer): Rows to skip
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  vessels(params: VesselsParams): Promise<Record<string, any>>;
  /**
   * Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
   * market and size class, length and width. Build year is not public on the site (login
   * only) and is not returned.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
   *     `ref` of a list row, for vessels with no IMO)
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  vesselsByImo(params: VesselsByImoParams): Promise<Record<string, any>>;
  /**
   * Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
   * status, time of report) with its voyage: reported destination, ETA, departure and
   * arrival ports.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
   *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
   *     minutes)
   */
  vesselsPositionByImo(params: VesselsPositionByImoParams): Promise<Record<string, any>>;
}
