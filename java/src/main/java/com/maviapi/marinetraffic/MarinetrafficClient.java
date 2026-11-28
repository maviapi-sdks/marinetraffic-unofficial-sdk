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
    public String ports(Map<String, Object> params) {
        return get("/ports", params);
    }

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
    public String portsByPort(Map<String, Object> params) {
        return get("/ports/{port}", params, "port");
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
    public String portsVesselsByPort(Map<String, Object> params) {
        return get("/ports/{port}/vessels", params, "port");
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
     *   query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
     *     UN/LOCODE (kind=port)
     *   kind (string): what to resolve the text to: vessel or port. One of: vessel, port
     *   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
     *   undefined (string)
     */
    public String track(Map<String, Object> params) {
        return get("/track", params);
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
     *   query (string): vessel name (at least 3 characters), IMO number or MMSI
     *   limit (integer): Rows in one page, 1 to 200 (default 50)
     *   offset (integer): Rows to skip before the page starts (default 0)
     *   undefined (string)
     *   undefined (string)
     *   undefined (string)
     */
    public String vessels(Map<String, Object> params) {
        return get("/vessels", params);
    }

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
    public String vesselsByImo(Map<String, Object> params) {
        return get("/vessels/{imo}", params, "imo");
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
     *   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
     *   undefined (string)
     */
    public String vesselsPositionByImo(Map<String, Object> params) {
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
