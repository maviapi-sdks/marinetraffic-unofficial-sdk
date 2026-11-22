// Unofficial MarineTraffic API client for Java 11+.
// Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic

package com.maviapi.marinetraffic;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/** MarineTraffic API client. Every method returns the response body: a JSON document. */
public class MarinetrafficClient {
    public static final String DEMO_KEY = "mvk_test_playground_5f3c1a8d";

    /** An error status answered by the API. Its body is a JSON object with "error" and "message". */
    public static class ApiError extends RuntimeException {
        private final int status;
        private final String body;

        public ApiError(int status, String body) {
            super(status + ": " + body);
            this.status = status;
            this.body = body;
        }

        public int getStatus() {
            return status;
        }

        public String getBody() {
            return body;
        }
    }

    private final String apiKey;
    private final String baseUrl;
    private final HttpClient http = HttpClient.newHttpClient();

    /** Uses the MAVIAPI_API_KEY environment variable, then the shared demo key. */
    public MarinetrafficClient() {
        this(null, null);
    }

    public MarinetrafficClient(String apiKey) {
        this(apiKey, null);
    }

    public MarinetrafficClient(String apiKey, String baseUrl) {
        this.apiKey = first(apiKey, System.getenv("MAVIAPI_API_KEY"), DEMO_KEY);
        String root = first(baseUrl, System.getenv("MAVIAPI_BASE_URL"), "https://api.maviapi.com");
        while (root.endsWith("/")) {
            root = root.substring(0, root.length() - 1);
        }
        this.baseUrl = root + "/v1/sites/marinetraffic";
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
     *   query (string, required): Port name (at least 3 characters) or UN/LOCODE
     *   limit (integer): Rows per page (default 50, max 200)
     *   offset (integer): Rows to skip
     *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     */
    public String ports(Map<String, Object> params) {
        return get("/ports", params, "query");
    }

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
    public String portsPort(Map<String, Object> params) {
        return get("/ports/{port}", params, "port");
    }

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
    public String portsPortVessels(Map<String, Object> params) {
        return get("/ports/{port}/vessels", params, "port");
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
     *   query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
     *   kind (string): What to resolve the text to. One of: vessel, port
     *   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
     *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     */
    public String track(Map<String, Object> params) {
        return get("/track", params, "query");
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
     *   query (string, required): Vessel name (at least 3 characters), IMO number or
     *     MMSI
     *   limit (integer): Rows per page (default 50, max 200)
     *   offset (integer): Rows to skip
     *   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
     *     minutes)
     */
    public String vessels(Map<String, Object> params) {
        return get("/vessels", params, "query");
    }

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
    public String vesselsImo(Map<String, Object> params) {
        return get("/vessels/{imo}", params, "imo");
    }

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
    public String vesselsImoPosition(Map<String, Object> params) {
        return get("/vessels/{imo}/position", params, "imo");
    }

    private static String first(String... values) {
        for (String value : values) {
            if (value != null && !value.isEmpty()) {
                return value;
            }
        }
        return "";
    }

    private String get(String path, Map<String, Object> params, String... required) {
        for (String name : required) {
            if (params.get(name) == null) {
                throw new IllegalArgumentException("Missing required parameter: " + name);
            }
        }
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            String token = "{" + entry.getKey() + "}";
            String text = URLEncoder.encode(String.valueOf(entry.getValue()), StandardCharsets.UTF_8);
            if (path.contains(token)) {
                path = path.replace(token, text.replace("+", "%20"));
            } else {
                query.append(query.length() == 0 ? "?" : "&")
                    .append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append("=")
                    .append(text);
            }
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path + query))
            .timeout(Duration.ofSeconds(120))
            .header("Authorization", "Bearer " + apiKey)
            .header("Accept", "application/json")
            .header("User-Agent", "marinetraffic-unofficial-sdk/0.1.0 (java)")
            .GET()
            .build();
        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiError(response.statusCode(), response.body());
            }
            return response.body();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
