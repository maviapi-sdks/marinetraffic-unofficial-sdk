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

    // Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
    // UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
    // has no paging.
    //
    // Each successful request uses 10 credits for every 12 rows it returns (at least 10
    // credits).
    //
    // Parameters:
    //   query (string, required): Port name (at least 3 characters) or UN/LOCODE
    //   limit (integer): Rows per page (default 50, max 200)
    //   offset (integer): Rows to skip
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> PortsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/ports", parameters, cancellationToken, "query");

    // Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
    // other names and its anchorages.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
    //     2036, the port_id of /ports)
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> PortsPortAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/ports/{port}", parameters, cancellationToken, "port");

    // Ships currently in or near a port: every vessel the live map shows within radius_km
    // of the port's position, nearest first, with position, speed, course, destination and
    // size. `complete` is false only if part of the area could not be read.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   port (string, required): UN/LOCODE or MarineTraffic port id
    //   radius_km (number): Search radius around the port position, 0.5 to 15 km
    //   vessel_type (string): Only vessels of this map category. One of: cargo, tanker,
    //     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
    //     unspecified
    //   moving (boolean): true: only vessels moving at 1 knot or more; false: only
    //     vessels stopped or moored
    //   limit (integer): Rows per page (default 50, max 200)
    //   offset (integer): Rows to skip
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> PortsPortVesselsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/ports/{port}/vessels", parameters, cancellationToken, "port");

    // One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
    // exact vessel name and returns its details and latest position. kind=port: resolves a
    // UN/LOCODE or exact port name and returns its details and the nearest vessels within
    // 5 km. An ambiguous name answers 400 with candidates.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
    //   kind (string): What to resolve the text to. One of: vessel, port
    //   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> TrackAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/track", parameters, cancellationToken, "query");

    // Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
    // call sign, flag, type, size). The site returns at most 12 matches per query and has
    // no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.
    //
    // Each successful request uses 10 credits for every 12 rows it returns (at least 10
    // credits).
    //
    // Parameters:
    //   query (string, required): Vessel name (at least 3 characters), IMO number or
    //     MMSI
    //   limit (integer): Rows per page (default 50, max 200)
    //   offset (integer): Rows to skip
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> VesselsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/vessels", parameters, cancellationToken, "query");

    // Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
    // market and size class, length and width. Build year is not public on the site (login
    // only) and is not returned.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
    //     `ref` of a list row, for vessels with no IMO)
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> VesselsImoAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/vessels/{imo}", parameters, cancellationToken, "imo");

    // Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
    // status, time of report) with its voyage: reported destination, ETA, departure and
    // arrival ports.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
    //   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    //     minutes)
    public Task<JsonElement> VesselsImoPositionAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
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
