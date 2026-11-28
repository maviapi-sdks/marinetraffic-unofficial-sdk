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

// Ports: Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
// in the site's relevance order (the site returns at most about 12 matches). Each row
// has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
// code it matched on.
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - query (string): port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam"
//     or "NLRTM"
//   - limit (integer): Rows in one page, 1 to 200 (default 50)
//   - offset (integer): Rows to skip before the page starts (default 0)
//   - undefined (string)
//   - undefined (string)
//   - undefined (string)
func (c *Client) Ports(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/ports", params)
}

// PortsByPort: Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
// in hours, alternative names, its anchorages, related ports and the site's
// one-paragraph summary.
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
//     2036, the port_id of /ports)
//   - undefined (string)
func (c *Client) PortsByPort(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/ports/{port}", params, "port")
}

// PortsVesselsByPort: Ships currently in or near a port: every vessel the live map shows within radius_km
// of the port's position, nearest first, including anonymous satellite positions (name
// "[SAT-AIS]", `ref` null), with position, distance, speed, course, heading, AIS
// destination, size, deadweight and the age of the position. `complete` is false only
// if part of the area could not be read; `map_requests` is how many map tiles were
// read.
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
//   - radius_km (number): search radius around the port position, 0.5 to 15 km
//   - vessel_type (string): only vessels of this map category (cargo, tanker,
//     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
//     unspecified)
//   - moving (string): true for only vessels moving at 1 knot or more, false for only
//     vessels stopped or moored
//   - limit (integer): Rows in one page, 1 to 200 (default 50)
//   - offset (integer): Rows to skip before the page starts (default 0)
//   - undefined (string)
//   - undefined (string)
//   - undefined (string)
func (c *Client) PortsVesselsByPort(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/ports/{port}/vessels", params, "port")
}

// Track: From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact
// vessel name and returns the vessel's details (`vessel`) and latest position with
// voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns
// the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest
// first). `resolved` says what the text was resolved to. A name matching several
// vessels or ports is refused as ambiguous, with the candidates listed in the error.
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
//     UN/LOCODE (kind=port)
//   - kind (string): what to resolve the text to: vessel or port. One of: vessel, port
//   - nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
//   - undefined (string)
func (c *Client) Track(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/track", params)
}

// Vessels: Vessels whose name (current or former), IMO or MMSI matches the text, in the site's
// relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific
// vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign,
// flag, type, market, size class, length and width, plus the name or number it matched
// on.
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - query (string): vessel name (at least 3 characters), IMO number or MMSI
//   - limit (integer): Rows in one page, 1 to 200 (default 50)
//   - offset (integer): Rows to skip before the page starts (default 0)
//   - undefined (string)
//   - undefined (string)
//   - undefined (string)
func (c *Client) Vessels(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/vessels", params)
}

// VesselsByImo: Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
// AIS type, commercial market and size class, length and width, AIS class, home port
// and the site's summary sentence. Build year is not public and is not returned.
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
//     `ref` of a list row, for vessels with no IMO)
//   - undefined (string)
func (c *Client) VesselsByImo(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/vessels/{imo}", params, "imo")
}

// VesselsPositionByImo: Latest AIS position of one vessel (latitude/longitude, speed in knots, course,
// heading, rate of turn, draught, navigational status, sea area, report time in UTC
// and its age, reception type) with its voyage: destination reported over AIS, ETA,
// progress, departure port and time, arrival port and time (actual once arrived, else
// estimated).
//
// Each successful request uses 5 credits.
//
// Parameters:
//
//   - imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
//   - undefined (string)
func (c *Client) VesselsPositionByImo(ctx context.Context, params Params) (json.RawMessage, error) {
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
