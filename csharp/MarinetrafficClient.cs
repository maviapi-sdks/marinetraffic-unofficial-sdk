// Unofficial MarineTraffic API client for .NET.
// Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic

using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;

namespace MarinetrafficSdk;

/// <summary>An error status answered by the API.</summary>
public class ApiError : Exception
{
    public int Status { get; }
    public string Code { get; }

    public ApiError(int status, string code, string message) : base($"{status} {code}: {message}")
    {
        Status = status;
        Code = code;
    }
}

public class MarinetrafficClient
{
    public const string DemoKey = "mvk_test_playground_5f3c1a8d";

    private readonly string _apiKey;
    private readonly string _baseUrl;
    private readonly HttpClient _http;

    /// <summary>
    /// With no apiKey it uses the MAVIAPI_API_KEY environment variable, then the
    /// shared demo key.
    /// </summary>
    public MarinetrafficClient(string? apiKey = null, string? baseUrl = null, HttpClient? http = null)
    {
        _apiKey = First(apiKey, Environment.GetEnvironmentVariable("MAVIAPI_API_KEY"), DemoKey);
        var root = First(baseUrl, Environment.GetEnvironmentVariable("MAVIAPI_BASE_URL"), "https://api.maviapi.com");
        _baseUrl = root.TrimEnd('/') + "/v1/sites/marinetraffic";
        _http = http ?? new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
    }

    // Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
    // in the site's relevance order (the site returns at most about 12 matches). Each row
    // has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
    // code it matched on.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   query (string): port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam"
    //     or "NLRTM"
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> PortsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/ports", parameters, cancellationToken);

    // Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
    // in hours, alternative names, its anchorages, related ports and the site's
    // one-paragraph summary.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
    //     2036, the port_id of /ports)
    //   undefined (string)
    public Task<JsonElement> PortsByPortAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/ports/{port}", parameters, cancellationToken, "port");

    // Ships currently in or near a port: every vessel the live map shows within radius_km
    // of the port's position, nearest first, including anonymous satellite positions (name
    // "[SAT-AIS]", `ref` null), with position, distance, speed, course, heading, AIS
    // destination, size, deadweight and the age of the position. `complete` is false only
    // if part of the area could not be read; `map_requests` is how many map tiles were
    // read.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
    //   radius_km (number): search radius around the port position, 0.5 to 15 km
    //   vessel_type (string): only vessels of this map category (cargo, tanker,
    //     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
    //     unspecified)
    //   moving (string): true for only vessels moving at 1 knot or more, false for only
    //     vessels stopped or moored
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> PortsVesselsByPortAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/ports/{port}/vessels", parameters, cancellationToken, "port");

    // From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact
    // vessel name and returns the vessel's details (`vessel`) and latest position with
    // voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns
    // the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest
    // first). `resolved` says what the text was resolved to. A name matching several
    // vessels or ports is refused as ambiguous, with the candidates listed in the error.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
    //     UN/LOCODE (kind=port)
    //   kind (string): what to resolve the text to: vessel or port. One of: vessel, port
    //   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
    //   undefined (string)
    public Task<JsonElement> TrackAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/track", parameters, cancellationToken);

    // Vessels whose name (current or former), IMO or MMSI matches the text, in the site's
    // relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific
    // vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign,
    // flag, type, market, size class, length and width, plus the name or number it matched
    // on.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   query (string): vessel name (at least 3 characters), IMO number or MMSI
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> VesselsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/vessels", parameters, cancellationToken);

    // Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
    // AIS type, commercial market and size class, length and width, AIS class, home port
    // and the site's summary sentence. Build year is not public and is not returned.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
    //     `ref` of a list row, for vessels with no IMO)
    //   undefined (string)
    public Task<JsonElement> VesselsByImoAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/vessels/{imo}", parameters, cancellationToken, "imo");

    // Latest AIS position of one vessel (latitude/longitude, speed in knots, course,
    // heading, rate of turn, draught, navigational status, sea area, report time in UTC
    // and its age, reception type) with its voyage: destination reported over AIS, ETA,
    // progress, departure port and time, arrival port and time (actual once arrived, else
    // estimated).
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
    //   undefined (string)
    public Task<JsonElement> VesselsPositionByImoAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/vessels/{imo}/position", parameters, cancellationToken, "imo");

    private static string First(params string?[] values) => values.First(value => !string.IsNullOrEmpty(value))!;

    private async Task<JsonElement> GetAsync(string path, IDictionary<string, object?> parameters, CancellationToken cancellationToken, params string[] required)
    {
        foreach (var name in required)
        {
            if (!parameters.TryGetValue(name, out var given) || given is null)
            {
                throw new ArgumentException($"Missing required parameter: {name}");
            }
        }
        var query = new List<string>();
        foreach (var (name, value) in parameters)
        {
            if (value is null)
            {
                continue;
            }
            var text = value switch
            {
                bool flag => flag ? "true" : "false",
                IFormattable number => number.ToString(null, CultureInfo.InvariantCulture),
                _ => value.ToString() ?? "",
            };
            var token = "{" + name + "}";
            if (path.Contains(token))
            {
                path = path.Replace(token, Uri.EscapeDataString(text));
            }
            else
            {
                query.Add(Uri.EscapeDataString(name) + "=" + Uri.EscapeDataString(text));
            }
        }
        var url = _baseUrl + path + (query.Count > 0 ? "?" + string.Join("&", query) : "");
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Headers.Accept.ParseAdd("application/json");
        request.Headers.UserAgent.ParseAdd("marinetraffic-unofficial-sdk/0.1.0 (csharp)");
        using var response = await _http.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        JsonElement? data = null;
        try
        {
            using var document = JsonDocument.Parse(body);
            data = document.RootElement.Clone();
        }
        catch (JsonException)
        {
        }
        if (response.IsSuccessStatusCode && data is JsonElement result)
        {
            return result;
        }
        string Field(string name, string fallback) =>
            data is { ValueKind: JsonValueKind.Object } detail && detail.TryGetProperty(name, out var field) && field.ValueKind == JsonValueKind.String
                ? field.GetString()!
                : fallback;
        throw new ApiError((int)response.StatusCode, Field("error", "http_error"), Field("message", body.Length > 200 ? body[..200] : body));
    }
}
