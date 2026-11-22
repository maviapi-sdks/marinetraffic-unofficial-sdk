// Package marinetraffic is an unofficial MarineTraffic API client.
//
// Vessel and port data from MarineTraffic: search vessels by name, IMO or MMSI; vessel
// particulars; latest AIS position and voyage (destination, ETA); port search and
// details; and the ships in or near a port.
//
// Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic
package marinetraffic

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	Version = "0.1.0"
	// DemoKey is the shared demo key a client uses when it is given no key.
	DemoKey = "mvk_test_playground_5f3c1a8d"
)

// Params are an endpoint's parameters by name. Those named in the endpoint's
// path go there, the rest in the query string.
type Params map[string]any

// Error is an error status answered by the API.
type Error struct {
	Status  int
	Code    string
	Message string
}

func (e *Error) Error() string { return fmt.Sprintf("%d %s: %s", e.Status, e.Code, e.Message) }

// Client calls the MarineTraffic API. Its fields may be changed after New.
type Client struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

// New returns a client. With an empty apiKey it uses the MAVIAPI_API_KEY
// environment variable, then the shared demo key.
func New(apiKey string) *Client {
	if apiKey == "" {
		apiKey = os.Getenv("MAVIAPI_API_KEY")
	}
	if apiKey == "" {
		apiKey = DemoKey
	}
	root := os.Getenv("MAVIAPI_BASE_URL")
	if root == "" {
		root = "https://api.maviapi.com"
	}
	return &Client{
		APIKey:     apiKey,
		BaseURL:    strings.TrimRight(root, "/") + "/v1/sites/marinetraffic",
		HTTPClient: &http.Client{Timeout: 120 * time.Second},
	}
}

// Ports: Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
// UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
// has no paging.
//
// Each successful request uses 10 credits for every 12 rows it returns (at least 10
// credits).
//
// Parameters:
//
//   - query (string, required): Port name (at least 3 characters) or UN/LOCODE
//   - limit (integer): Rows per page (default 50, max 200)
//   - offset (integer): Rows to skip
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) Ports(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/ports", params, "query")
}

// PortsPort: Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
// other names and its anchorages.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
//     2036, the port_id of /ports)
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) PortsPort(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/ports/{port}", params, "port")
}

// PortsPortVessels: Ships currently in or near a port: every vessel the live map shows within radius_km
// of the port's position, nearest first, with position, speed, course, destination and
// size. `complete` is false only if part of the area could not be read.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - port (string, required): UN/LOCODE or MarineTraffic port id
//   - radius_km (number): Search radius around the port position, 0.5 to 15 km
//   - vessel_type (string): Only vessels of this map category. One of: cargo, tanker,
//     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
//     unspecified
//   - moving (boolean): true: only vessels moving at 1 knot or more; false: only
//     vessels stopped or moored
//   - limit (integer): Rows per page (default 50, max 200)
//   - offset (integer): Rows to skip
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) PortsPortVessels(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/ports/{port}/vessels", params, "port")
}

// Track: One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
// exact vessel name and returns its details and latest position. kind=port: resolves a
// UN/LOCODE or exact port name and returns its details and the nearest vessels within
// 5 km. An ambiguous name answers 400 with candidates.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
//   - kind (string): What to resolve the text to. One of: vessel, port
//   - nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) Track(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/track", params, "query")
}

// Vessels: Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
// call sign, flag, type, size). The site returns at most 12 matches per query and has
// no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.
//
// Each successful request uses 10 credits for every 12 rows it returns (at least 10
// credits).
//
// Parameters:
//
//   - query (string, required): Vessel name (at least 3 characters), IMO number or
//     MMSI
//   - limit (integer): Rows per page (default 50, max 200)
//   - offset (integer): Rows to skip
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) Vessels(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/vessels", params, "query")
}

// VesselsImo: Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
// market and size class, length and width. Build year is not public on the site (login
// only) and is not returned.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
//     `ref` of a list row, for vessels with no IMO)
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) VesselsImo(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/vessels/{imo}", params, "imo")
}

// VesselsImoPosition: Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
// status, time of report) with its voyage: reported destination, ETA, departure and
// arrival ports.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
//   - refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
//     minutes)
func (c *Client) VesselsImoPosition(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/vessels/{imo}/position", params, "imo")
}

func (c *Client) get(ctx context.Context, path string, params Params, required ...string) (json.RawMessage, error) {
	for _, name := range required {
		if params[name] == nil {
			return nil, fmt.Errorf("missing required parameter: %s", name)
		}
	}
	query := url.Values{}
	for name, value := range params {
		if value == nil {
			continue
		}
		text := fmt.Sprint(value)
		if token := "{" + name + "}"; strings.Contains(path, token) {
			path = strings.ReplaceAll(path, token, url.PathEscape(text))
		} else {
			query.Set(name, text)
		}
	}
	target := c.BaseURL + path
	if len(query) > 0 {
		target += "?" + query.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "marinetraffic-unofficial-sdk/0.1.0 (go)")
	res, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode >= 400 {
		failure := &Error{Status: res.StatusCode, Code: "http_error", Message: string(body)}
		var detail struct{ Error, Message string }
		if json.Unmarshal(body, &detail) == nil && detail.Error != "" {
			failure.Code, failure.Message = detail.Error, detail.Message
		}
		return nil, failure
	}
	return body, nil
}
