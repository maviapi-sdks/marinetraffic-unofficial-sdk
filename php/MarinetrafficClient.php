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
     * Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
     * UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
     * has no paging.
     *
     * Each successful request uses 10 credits for every 12 rows it returns (at least 10
     * credits).
     *
     * Parameters:
     *   $query (string, required): Port name (at least 3 characters) or UN/LOCODE
     *   $limit (integer): Rows per page (default 50, max 200)
     *   $offset (integer): Rows to skip
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function ports(string $query, ?int $limit = null, ?int $offset = null, ?bool $refresh = null): array
    {
        return $this->get('/ports', ['query' => $query, 'limit' => $limit, 'offset' => $offset, 'refresh' => $refresh]);
    }

    /**
     * Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
     * other names and its anchorages.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
     *     2036, the port_id of /ports)
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function portsPort(string $port, ?bool $refresh = null): array
    {
        return $this->get('/ports/{port}', ['port' => $port, 'refresh' => $refresh]);
    }

    /**
     * Ships currently in or near a port: every vessel the live map shows within radius_km
     * of the port's position, nearest first, with position, speed, course, destination and
     * size. `complete` is false only if part of the area could not be read.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $port (string, required): UN/LOCODE or MarineTraffic port id
     *   $radius_km (number): Search radius around the port position, 0.5 to 15 km
     *   $vessel_type (string): Only vessels of this map category. One of: cargo, tanker,
     *     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
     *     unspecified
     *   $moving (boolean): true: only vessels moving at 1 knot or more; false: only
     *     vessels stopped or moored
     *   $limit (integer): Rows per page (default 50, max 200)
     *   $offset (integer): Rows to skip
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function portsPortVessels(string $port, ?float $radius_km = null, ?string $vessel_type = null, ?bool $moving = null, ?int $limit = null, ?int $offset = null, ?bool $refresh = null): array
    {
        return $this->get('/ports/{port}/vessels', ['port' => $port, 'radius_km' => $radius_km, 'vessel_type' => $vessel_type, 'moving' => $moving, 'limit' => $limit, 'offset' => $offset, 'refresh' => $refresh]);
    }

    /**
     * One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
     * exact vessel name and returns its details and latest position. kind=port: resolves a
     * UN/LOCODE or exact port name and returns its details and the nearest vessels within
     * 5 km. An ambiguous name answers 400 with candidates.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
     *   $kind (string): What to resolve the text to. One of: vessel, port
     *   $nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function track(string $query, ?string $kind = null, ?int $nearby = null, ?bool $refresh = null): array
    {
        return $this->get('/track', ['query' => $query, 'kind' => $kind, 'nearby' => $nearby, 'refresh' => $refresh]);
    }

    /**
     * Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
     * call sign, flag, type, size). The site returns at most 12 matches per query and has
     * no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.
     *
     * Each successful request uses 10 credits for every 12 rows it returns (at least 10
     * credits).
     *
     * Parameters:
     *   $query (string, required): Vessel name (at least 3 characters), IMO number or
     *     MMSI
     *   $limit (integer): Rows per page (default 50, max 200)
     *   $offset (integer): Rows to skip
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function vessels(string $query, ?int $limit = null, ?int $offset = null, ?bool $refresh = null): array
    {
        return $this->get('/vessels', ['query' => $query, 'limit' => $limit, 'offset' => $offset, 'refresh' => $refresh]);
    }

    /**
     * Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
     * market and size class, length and width. Build year is not public on the site (login
     * only) and is not returned.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
     *     `ref` of a list row, for vessels with no IMO)
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function vesselsImo(string $imo, ?bool $refresh = null): array
    {
        return $this->get('/vessels/{imo}', ['imo' => $imo, 'refresh' => $refresh]);
    }

    /**
     * Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
     * status, time of report) with its voyage: reported destination, ETA, departure and
     * arrival ports.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
     *   $refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     *
     * @return array<string, mixed>
     */
    public function vesselsImoPosition(string $imo, ?bool $refresh = null): array
    {
        return $this->get('/vessels/{imo}/position', ['imo' => $imo, 'refresh' => $refresh]);
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
