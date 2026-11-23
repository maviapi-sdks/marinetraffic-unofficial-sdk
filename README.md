# MarineTraffic Unofficial SDK

Unofficial **MarineTraffic API** client for Python, JavaScript/TypeScript, Go, PHP, Ruby, Java and C#. Vessel and port data from MarineTraffic: search vessels by name, IMO or MMSI; vessel particulars; latest AIS position and voyage (destination, ETA); port search and details; and the ships in or near a port.

- **7 endpoints**, each returning JSON, with one method per endpoint in every language.
- **Works with no setup.** With no key, a client uses a shared demo key (30 requests a minute and 300 a day per network).
- **Your own key lifts the limit.** [Create a free key](https://maviapi.com/sign-up?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic): a 7-day trial with 5,000 credits, no card.
- **Kept working.** The API is hosted by [maviapi](https://maviapi.com/apis/marinetraffic?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic), which monitors it and repairs it when the website changes.

> This project is not affiliated with, endorsed by or sponsored by MarineTraffic (marinetraffic.com). All trademarks belong to their owners.

## Quick start

### Python

```bash
pip install "git+https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk#subdirectory=python"
```

```python
from marinetraffic_sdk import MarinetrafficClient

client = MarinetrafficClient()  # or MarinetrafficClient("mvk_live_...")
result = client.vessels(query="ever given")
print(result)
```

### JavaScript / TypeScript

```bash
npm install github:maviapi-sdks/marinetraffic-unofficial-sdk
```

```javascript
import { MarinetrafficClient } from "marinetraffic-unofficial-sdk";

const client = new MarinetrafficClient(); // or new MarinetrafficClient({ apiKey: "mvk_live_..." })
const result = await client.vessels({ query: "ever given" });
console.log(result);
```

### Go

```bash
go get github.com/maviapi-sdks/marinetraffic-unofficial-sdk
```

```go
package main

import (
	"context"
	"fmt"
	"log"

	marinetraffic "github.com/maviapi-sdks/marinetraffic-unofficial-sdk"
)

func main() {
	client := marinetraffic.New("") // or marinetraffic.New("mvk_live_...")
	result, err := client.Vessels(context.Background(), marinetraffic.Params{"query": "ever given"})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(result))
}
```

### PHP

```bash
composer config repositories.marinetraffic-unofficial-sdk vcs https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk
composer require maviapi-sdks/marinetraffic-unofficial-sdk:dev-main
```

```php
<?php

require 'vendor/autoload.php';

use MarinetrafficSdk\MarinetrafficClient;

$client = new MarinetrafficClient(); // or new MarinetrafficClient('mvk_live_...')
$result = $client->vessels(query: 'ever given');
print_r($result);
```

### Ruby

```ruby
# Gemfile
gem "marinetraffic_sdk", git: "https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk", branch: "main"
```

```ruby
require "marinetraffic_sdk"

client = MarinetrafficSdk::Client.new # or MarinetrafficSdk::Client.new(api_key: "mvk_live_...")
result = client.vessels(query: "ever given")
puts result
```

### Java

```xml
<!-- pom.xml: the JitPack repository, then the dependency -->
<repository>
  <id>jitpack.io</id>
  <url>https://jitpack.io</url>
</repository>

<dependency>
  <groupId>com.github.maviapi-sdks</groupId>
  <artifactId>marinetraffic-unofficial-sdk</artifactId>
  <version>main-SNAPSHOT</version>
</dependency>
```

The client is one file with no dependencies, so you can also copy [`MarinetrafficClient.java`](java/src/main/java/com/maviapi/marinetraffic/MarinetrafficClient.java) into your project.

```java
import com.maviapi.marinetraffic.MarinetrafficClient;
import java.util.Map;

public class Example {
    public static void main(String[] args) {
        MarinetrafficClient client = new MarinetrafficClient(); // or new MarinetrafficClient("mvk_live_...")
        String json = client.vessels(Map.of("query", "ever given"));
        System.out.println(json);
    }
}
```

### C#

```bash
git clone https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk
dotnet add reference marinetraffic-unofficial-sdk/csharp/MarinetrafficSdk.csproj
```

The client is one file with no dependencies, so you can also copy [`MarinetrafficClient.cs`](csharp/MarinetrafficClient.cs) into your project.

```csharp
using MarinetrafficSdk;

var client = new MarinetrafficClient(); // or new MarinetrafficClient("mvk_live_...")
var result = await client.VesselsAsync(new Dictionary<string, object?> { ["query"] = "ever given" });
Console.WriteLine(result);
```

## Endpoints

| Endpoint | What it returns | Credits per call |
|---|---|---|
| [`GET /ports`](#get-ports) | Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country, UN/LOCODE and coordinates. | 10 |
| [`GET /ports/{port}`](#get-portsport) | Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone, other names and its anchorages. | 10 |
| [`GET /ports/{port}/vessels`](#get-portsportvessels) | Ships currently in or near a port: every vessel the live map shows within radius_km of the port's position, nearest first, with position, speed, course, destination and size. | 10 |
| [`GET /track`](#get-track) | One call from free text to the live picture. | 10 |
| [`GET /vessels`](#get-vessels) | Search vessels by name, IMO or MMSI. | 10 |
| [`GET /vessels/{imo}`](#get-vesselsimo) | Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial market and size class, length and width. | 10 |
| [`GET /vessels/{imo}/position`](#get-vesselsimoposition) | Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational status, time of report) with its voyage: reported destination, ETA, departure and arrival ports. | 10 |

Try each one in the browser on the [MarineTraffic API page](https://maviapi.com/apis/marinetraffic?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic).

## Authentication

A client takes the key you give it. With none, it reads the `MAVIAPI_API_KEY` environment variable, and then uses the shared demo key (30 requests a minute and 300 a day per network). To get your own, [sign up](https://maviapi.com/sign-up?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic) and create a key on the [keys page](https://maviapi.com/dashboard/keys). A successful request uses the credits its endpoint lists; a failed request is free. Plans are on the [pricing page](https://maviapi.com/pricing?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic).

## Errors

A request the API answers with an error status raises an `ApiError` (in Go, returns an `*Error`) with the HTTP status, a machine-readable code and a message. In Java it carries the status and the response body.

| Status | Code | Meaning |
|---|---|---|
| 400 | `bad_request` | A parameter is missing or cannot be used. |
| 401 | `missing_api_key` | No API key was sent, or the key is invalid or revoked (`missing_api_key`, `invalid_api_key`). |
| 402 | `credit_limit_reached` | The plan's credits for this period are used up. |
| 403 | `account_banned` | The account that owns the key is suspended. |
| 429 | `rate_limited` | Too many requests for this key. Wait the number of seconds in `Retry-After`. |
| 502 | `scrape_failed` | The source site could not be read this time. Retrying later usually works. |

## Endpoint reference

Base URL: `https://api.maviapi.com/v1/sites/marinetraffic`. API version 2026-11-21. The same contract is in [`openapi.json`](openapi.json).

### `GET /ports`

Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country, UN/LOCODE and coordinates. The site returns at most about 12 matches per query and has no paging.

Each successful request uses 10 credits for every 12 rows it returns (at least 10 credits).

Methods: `ports` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Ports` (Go) · `PortsAsync` (C#)

Parameters:

- `query` (string, required): Port name (at least 3 characters) or UN/LOCODE. Example: `rotterdam`.
- `limit` (integer, optional): Rows per page (default 50, max 200). Example: `50`.
- `offset` (integer, optional): Rows to skip. Example: `0`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "query": "rotterdam",
    "total": 7,
    "count": 7,
    "ports": [
      {
        "port_id": "2036",
        "name": "ROTTERDAM",
        "type": "Port",
        "country": "NETHERLANDS",
        "country_code": "NL",
        "unlocode": "NLRTM",
        "latitude": 51.943306,
        "longitude": 4.1418123,
        "size": "Large",
        "matched_on": "ROTTERDAM",
        "url": "https://www.marinetraffic.com/en/ais/details/ports/2036"
      }
    ]
  },
  "cached": false,
  "source": "marinetraffic:web",
  "pagination": {
    "total": 182,
    "limit": 50,
    "offset": 0,
    "count": 50,
    "has_more": true
  }
}
```

</details>

### `GET /ports/{port}`

Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone, other names and its anchorages.

Each successful request uses 10 credits.

Methods: `ports_port` (Python, Ruby) · `portsPort` (JavaScript/TypeScript, PHP, Java) · `PortsPort` (Go) · `PortsPortAsync` (C#)

Parameters:

- `port` (string, required, in the path): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g. 2036, the port_id of /ports). Example: `NLRTM`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "port_id": "2036",
    "name": "ROTTERDAM",
    "unlocode": "NLRTM",
    "country": "NETHERLANDS",
    "country_code": "NL",
    "type": "Port",
    "size": "Large",
    "latitude": 51.943306,
    "longitude": 4.1418123,
    "utc_offset_hours": 1,
    "alternative_names": [
      "EUROPOORT"
    ],
    "anchorages": [
      {
        "port_id": "22307",
        "name": "ROTTERDAM ANCH"
      }
    ],
    "related_ports": [
      {
        "port_id": "2033",
        "name": "ROTTERDAM BOTLEK"
      }
    ],
    "summary": "ROTTERDAM is located at UK Coast & Atlantic, Rotterdam Area in NETHERLANDS. The official UN/LOCODE of this port is NLRTM.",
    "url": "https://www.marinetraffic.com/en/ais/details/ports/2036"
  },
  "cached": false,
  "source": "marinetraffic:web"
}
```

</details>

### `GET /ports/{port}/vessels`

Ships currently in or near a port: every vessel the live map shows within radius_km of the port's position, nearest first, with position, speed, course, destination and size. `complete` is false only if part of the area could not be read.

Each successful request uses 10 credits.

Methods: `ports_port_vessels` (Python, Ruby) · `portsPortVessels` (JavaScript/TypeScript, PHP, Java) · `PortsPortVessels` (Go) · `PortsPortVesselsAsync` (C#)

Parameters:

- `port` (string, required, in the path): UN/LOCODE or MarineTraffic port id. Example: `NLRTM`.
- `radius_km` (number, optional): Search radius around the port position, 0.5 to 15 km. Example: `5`.
- `vessel_type` (string, optional): Only vessels of this map category. One of: `cargo`, `tanker`, `passenger`, `fishing`, `tug_special`, `high_speed`, `pleasure`, `navigation_aid`, `unspecified`. Example: `cargo`.
- `moving` (boolean, optional): true: only vessels moving at 1 knot or more; false: only vessels stopped or moored.
- `limit` (integer, optional): Rows per page (default 50, max 200). Example: `50`.
- `offset` (integer, optional): Rows to skip. Example: `0`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "port": {
      "port_id": "2036",
      "name": "ROTTERDAM",
      "unlocode": "NLRTM",
      "country_code": "NL",
      "latitude": 51.943306,
      "longitude": 4.1418123
    },
    "radius_km": 5,
    "vessel_type": null,
    "moving": null,
    "complete": true,
    "map_requests": 4,
    "count": 182,
    "vessels": [
      {
        "ship_id": "3387654",
        "ref": "shipid:3387654",
        "name": "SNIP",
        "flag_code": "NL",
        "vessel_type": "cargo",
        "latitude": 51.952328,
        "longitude": 4.1202168,
        "distance_km": 1.77,
        "speed_knots": 0,
        "course": null,
        "heading": 169,
        "destination": "ROTTERDAM",
        "length_m": 64,
        "width_m": 7,
        "dwt": 1200,
        "position_age_minutes": 2,
        "timestamp": "2026-11-21T06:40:00.000Z"
      }
    ]
  },
  "cached": false,
  "source": "marinetraffic:web",
  "pagination": {
    "total": 182,
    "limit": 50,
    "offset": 0,
    "count": 50,
    "has_more": true
  }
}
```

</details>

### `GET /track`

One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact vessel name and returns its details and latest position. kind=port: resolves a UN/LOCODE or exact port name and returns its details and the nearest vessels within 5 km. An ambiguous name answers 400 with candidates.

Each successful request uses 10 credits.

Methods: `track` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Track` (Go) · `TrackAsync` (C#)

Parameters:

- `query` (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE. Example: `ever given`.
- `kind` (string, optional): What to resolve the text to. One of: `vessel`, `port`. Example: `vessel`.
- `nearby` (integer, optional): kind=port: how many nearby vessels to include (0 to 50). Example: `10`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "kind": "vessel",
    "resolved": {
      "input": "ever given",
      "id": "shipid:5630138",
      "name": "EVER GIVEN",
      "type": "vessel"
    },
    "vessel": {
      "ship_id": "5630138",
      "ref": "shipid:5630138",
      "name": "EVER GIVEN",
      "ais_name": "EVER GIVEN",
      "imo": "9811000",
      "mmsi": "636026627",
      "call_sign": "A8AB9",
      "flag": "Liberia",
      "flag_code": "LR",
      "vessel_type": "Container Ship",
      "ais_type": "Cargo - Hazard A (Major)",
      "market": "CONTAINER SHIPS",
      "size_class": "ULCV",
      "length_m": 399.94,
      "width_m": 59,
      "ais_class": "Class A",
      "home_port": null,
      "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:5630138"
    },
    "position": {
      "name": "EVER GIVEN",
      "imo": "9811000",
      "mmsi": "636026627",
      "ship_id": "5630138",
      "latitude": 26.873938,
      "longitude": 122.03899,
      "speed_knots": 15.1,
      "course": 208,
      "heading": 213,
      "rate_of_turn": 9,
      "draught_m": 14.2,
      "status": "Underway using Engine",
      "area": "East China Sea",
      "timestamp": "2026-11-21T05:41:07.000Z",
      "position_age_minutes": 47,
      "received_by": "Roaming",
      "in_range": true,
      "destination": "TWTPE",
      "eta": "2026-11-21T14:00:00.000Z",
      "voyage_progress_pct": 70.9,
      "departure_port": {
        "port_id": "1253",
        "name": "SHANGHAI",
        "unlocode": "CNSHG",
        "country_code": "CN"
      },
      "departure_time": "2026-11-20T11:25:00.000Z",
      "arrival_port": {
        "port_id": "447",
        "name": "TAIPEI",
        "unlocode": "TWTPE",
        "country_code": "TW"
      },
      "arrival_time": "2026-11-21T14:00:00.000Z",
      "arrival_time_kind": "estimated"
    },
    "port": {
      "port_id": "2036",
      "name": "ROTTERDAM",
      "unlocode": "NLRTM",
      "country": "NETHERLANDS",
      "country_code": "NL",
      "type": "Port",
      "size": "Large",
      "latitude": 51.943306,
      "longitude": 4.1418123,
      "utc_offset_hours": 1,
      "alternative_names": [
        "EUROPOORT"
      ],
      "anchorages": [
        {
          "port_id": "22307",
          "name": "ROTTERDAM ANCH"
        }
      ],
      "related_ports": [
        {
          "port_id": "2033",
          "name": "ROTTERDAM BOTLEK"
        }
      ],
      "summary": "ROTTERDAM is located at UK Coast & Atlantic, Rotterdam Area in NETHERLANDS. The official UN/LOCODE of this port is NLRTM.",
      "url": "https://www.marinetraffic.com/en/ais/details/ports/2036"
    },
    "nearby": {
      "radius_km": 5,
      "count": 182,
      "vessels": [
        {
          "ship_id": "3387654",
          "ref": "shipid:3387654",
          "name": "SNIP",
          "flag_code": "NL",
          "vessel_type": "cargo",
          "latitude": 51.952328,
          "longitude": 4.1202168,
          "distance_km": 1.77,
          "speed_knots": 0,
          "course": null,
          "heading": 169,
          "destination": "ROTTERDAM",
          "length_m": 64,
          "width_m": 7,
          "dwt": 1200,
          "position_age_minutes": 2,
          "timestamp": "2026-11-21T06:40:00.000Z"
        }
      ]
    }
  },
  "cached": false,
  "source": "marinetraffic:web"
}
```

</details>

### `GET /vessels`

Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI, call sign, flag, type, size). The site returns at most 12 matches per query and has no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.

Each successful request uses 10 credits for every 12 rows it returns (at least 10 credits).

Methods: `vessels` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Vessels` (Go) · `VesselsAsync` (C#)

Parameters:

- `query` (string, required): Vessel name (at least 3 characters), IMO number or MMSI. Example: `ever given`.
- `limit` (integer, optional): Rows per page (default 50, max 200). Example: `50`.
- `offset` (integer, optional): Rows to skip. Example: `0`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "query": "ever given",
    "total": 1,
    "count": 1,
    "vessels": [
      {
        "ship_id": "5630138",
        "ref": "shipid:5630138",
        "name": "EVER GIVEN",
        "ais_name": "EVER GIVEN",
        "imo": "9811000",
        "mmsi": "636026627",
        "call_sign": "A8AB9",
        "flag": "Liberia",
        "flag_code": "LR",
        "vessel_type": "Container Ship",
        "ais_type": "Cargo - Hazard A (Major)",
        "market": "CONTAINER SHIPS",
        "size_class": "ULCV",
        "length_m": 399.94,
        "width_m": 59,
        "ais_class": "Class A",
        "home_port": null,
        "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:5630138",
        "matched_on": "EVER GIVEN"
      }
    ]
  },
  "cached": false,
  "source": "marinetraffic:web",
  "pagination": {
    "total": 182,
    "limit": 50,
    "offset": 0,
    "count": 50,
    "has_more": true
  }
}
```

</details>

### `GET /vessels/{imo}`

Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial market and size class, length and width. Build year is not public on the site (login only) and is not returned.

Each successful request uses 10 credits.

Methods: `vessels_imo` (Python, Ruby) · `vesselsImo` (JavaScript/TypeScript, PHP, Java) · `VesselsImo` (Go) · `VesselsImoAsync` (C#)

Parameters:

- `imo` (string, required, in the path): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the `ref` of a list row, for vessels with no IMO). Example: `9811000`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "ship_id": "5630138",
    "ref": "shipid:5630138",
    "name": "EVER GIVEN",
    "ais_name": "EVER GIVEN",
    "imo": "9811000",
    "mmsi": "636026627",
    "call_sign": "A8AB9",
    "flag": "Liberia",
    "flag_code": "LR",
    "vessel_type": "Container Ship",
    "ais_type": "Cargo - Hazard A (Major)",
    "market": "CONTAINER SHIPS",
    "size_class": "ULCV",
    "length_m": 399.94,
    "width_m": 59,
    "ais_class": "Class A",
    "home_port": null,
    "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:5630138",
    "summary": "EVER GIVEN (IMO: 9811000) is a Container Ship and is sailing under the flag of Liberia."
  },
  "cached": false,
  "source": "marinetraffic:web"
}
```

</details>

### `GET /vessels/{imo}/position`

Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational status, time of report) with its voyage: reported destination, ETA, departure and arrival ports.

Each successful request uses 10 credits.

Methods: `vessels_imo_position` (Python, Ruby) · `vesselsImoPosition` (JavaScript/TypeScript, PHP, Java) · `VesselsImoPosition` (Go) · `VesselsImoPositionAsync` (C#)

Parameters:

- `imo` (string, required, in the path): 7-digit IMO number, 9-digit MMSI, or shipid:<id>. Example: `9811000`.
- `refresh` (boolean, optional): Bypass and repopulate the cache (answers are cached for 5 minutes). Example: `false`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "name": "EVER GIVEN",
    "imo": "9811000",
    "mmsi": "636026627",
    "ship_id": "5630138",
    "latitude": 26.873938,
    "longitude": 122.03899,
    "speed_knots": 15.1,
    "course": 208,
    "heading": 213,
    "rate_of_turn": 9,
    "draught_m": 14.2,
    "status": "Underway using Engine",
    "area": "East China Sea",
    "timestamp": "2026-11-21T05:41:07.000Z",
    "position_age_minutes": 47,
    "received_by": "Roaming",
    "in_range": true,
    "destination": "TWTPE",
    "eta": "2026-11-21T14:00:00.000Z",
    "voyage_progress_pct": 70.9,
    "departure_port": {
      "port_id": "1253",
      "name": "SHANGHAI",
      "unlocode": "CNSHG",
      "country_code": "CN"
    },
    "departure_time": "2026-11-20T11:25:00.000Z",
    "arrival_port": {
      "port_id": "447",
      "name": "TAIPEI",
      "unlocode": "TWTPE",
      "country_code": "TW"
    },
    "arrival_time": "2026-11-21T14:00:00.000Z",
    "arrival_time_kind": "estimated"
  },
  "cached": false,
  "source": "marinetraffic:web"
}
```

</details>

## More

- [MarineTraffic API page](https://maviapi.com/apis/marinetraffic?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic): live examples and the changelog.
- [OpenAPI document](https://api.maviapi.com/v1/apis/marinetraffic/openapi.json) and [Postman collection](https://api.maviapi.com/v1/apis/marinetraffic/postman.json).
- [maviapi MCP server](https://maviapi.com/docs#mcp): the same API as tools for Claude, Cursor and other AI agents.
- [All maviapi APIs](https://maviapi.com/apis?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic). Need a website that is not there? [Ask for it](https://maviapi.com/?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic) and get an API for it.

Other unofficial SDKs: [GetYourGuide](https://github.com/maviapi-sdks/getyourguide-unofficial-sdk) · [Kiwi.com](https://github.com/maviapi-sdks/kiwi-unofficial-sdk) · [Trainline](https://github.com/maviapi-sdks/trainline-unofficial-sdk) · [Trendyol](https://github.com/maviapi-sdks/trendyol-unofficial-sdk) · [Tripadvisor](https://github.com/maviapi-sdks/tripadvisor-unofficial-sdk) · [Yemeksepeti](https://github.com/maviapi-sdks/yemeksepeti-unofficial-sdk)

## License

MIT. See [LICENSE](LICENSE).
