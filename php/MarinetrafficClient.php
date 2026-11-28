<?php

// Unofficial MarineTraffic API client for PHP.
// Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic

declare(strict_types=1);

namespace MarinetrafficSdk;

/** An error status answered by the API. */
class ApiError extends \RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
    ) {
        parent::__construct("$status $errorCode: $message", $status);
    }
}

class MarinetrafficClient
{
    public const DEMO_KEY = 'mvk_test_playground_5f3c1a8d';

    private string $apiKey;
    private string $baseUrl;

    /**
     * With no $apiKey it uses the MAVIAPI_API_KEY environment variable, then the
     * shared demo key.
     */
    public function __construct(?string $apiKey = null, ?string $baseUrl = null, private int $timeout = 120)
    {
        $this->apiKey = $apiKey ?: (getenv('MAVIAPI_API_KEY') ?: self::DEMO_KEY);
        $root = $baseUrl ?: (getenv('MAVIAPI_BASE_URL') ?: 'https://api.maviapi.com');
        $this->baseUrl = rtrim($root, '/') . '/v1/sites/marinetraffic';
    }

    /**
     * Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
     * in the site's relevance order (the site returns at most about 12 matches). Each row
     * has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
     * code it matched on.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $query (string): port name (at least 3 characters) or UN/LOCODE, e.g.
     *     "rotterdam" or "NLRTM"
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function ports(?string $query = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/ports', ['query' => $query, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
     * in hours, alternative names, its anchorages, related ports and the site's
     * one-paragraph summary.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
     *     2036, the port_id of /ports)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function portsByPort(string $port, ?string $undefined = null): array
    {
        return $this->get('/ports/{port}', ['port' => $port, undefined => $undefined]);
    }

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
     *   $port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
     *   $radius_km (number): search radius around the port position, 0.5 to 15 km
     *   $vessel_type (string): only vessels of this map category (cargo, tanker,
     *     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
     *     unspecified)
     *   $moving (string): true for only vessels moving at 1 knot or more, false for only
     *     vessels stopped or moored
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function portsVesselsByPort(string $port, ?float $radius_km = null, ?string $vessel_type = null, ?string $moving = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/ports/{port}/vessels', ['port' => $port, 'radius_km' => $radius_km, 'vessel_type' => $vessel_type, 'moving' => $moving, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
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
     *
     * Parameters:
     *   $query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
     *     UN/LOCODE (kind=port)
     *   $kind (string): what to resolve the text to: vessel or port. One of: vessel,
     *     port
     *   $nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function track(?string $query = null, ?string $kind = null, ?int $nearby = null, ?string $undefined = null): array
    {
        return $this->get('/track', ['query' => $query, 'kind' => $kind, 'nearby' => $nearby, undefined => $undefined]);
    }

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
     *   $query (string): vessel name (at least 3 characters), IMO number or MMSI
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function vessels(?string $query = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/vessels', ['query' => $query, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
     * AIS type, commercial market and size class, length and width, AIS class, home port
     * and the site's summary sentence. Build year is not public and is not returned.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
     *     `ref` of a list row, for vessels with no IMO)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function vesselsByImo(string $imo, ?string $undefined = null): array
    {
        return $this->get('/vessels/{imo}', ['imo' => $imo, undefined => $undefined]);
    }

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
     *   $imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function vesselsPositionByImo(string $imo, ?string $undefined = null): array
    {
        return $this->get('/vessels/{imo}/position', ['imo' => $imo, undefined => $undefined]);
    }

    /**
     * @param array<string, scalar|null> $params
     * @return array<string, mixed>
     */
    private function get(string $path, array $params): array
    {
        $query = [];
        foreach ($params as $name => $value) {
            if ($value === null) {
                continue;
            }
            $text = is_bool($value) ? ($value ? 'true' : 'false') : (string) $value;
            $token = '{' . $name . '}';
            if (str_contains($path, $token)) {
                $path = str_replace($token, rawurlencode($text), $path);
            } else {
                $query[$name] = $text;
            }
        }
        $curl = curl_init($this->baseUrl . $path . ($query ? '?' . http_build_query($query) : ''));
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_USERAGENT => 'marinetraffic-unofficial-sdk/0.1.0 (php)',
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $this->apiKey, 'Accept: application/json'],
        ]);
        $body = curl_exec($curl);
        if ($body === false) {
            throw new ApiError(0, 'network_error', curl_error($curl));
        }
        $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $data = json_decode($body, true);
        if ($status >= 400) {
            $detail = is_array($data) ? $data : [];
            throw new ApiError(
                $status,
                (string) ($detail['error'] ?? 'http_error'),
                (string) ($detail['message'] ?? substr($body, 0, 200)),
            );
        }
        return is_array($data) ? $data : [];
    }
}
