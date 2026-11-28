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
| [`GET /ports`](#get-ports) | Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text, in the site's relevance order (the site returns at most about 12 matches). | 5 |
| [`GET /ports/{port}`](#get-portsport) | Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset in hours, alternative names, its anchorages, related ports and the site's one-paragraph summary. | 5 |
| [`GET /ports/{port}/vessels`](#get-portsportvessels) | Ships currently in or near a port: every vessel the live map shows within radius_km of the port's position, nearest first, including anonymous satellite positions (name "[SAT-AIS]", `ref` null), with position, distance, speed, course, heading, AIS destination, size, deadweight and the age of the position. | 5 |
| [`GET /track`](#get-track) | From free text to the live picture. | 5 |
| [`GET /vessels`](#get-vessels) | Vessels whose name (current or former), IMO or MMSI matches the text, in the site's relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific vessel). | 5 |
| [`GET /vessels/{imo}`](#get-vesselsimo) | Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type, AIS type, commercial market and size class, length and width, AIS class, home port and the site's summary sentence. | 5 |
| [`GET /vessels/{imo}/position`](#get-vesselsimoposition) | Latest AIS position of one vessel (latitude/longitude, speed in knots, course, heading, rate of turn, draught, navigational status, sea area, report time in UTC and its age, reception type) with its voyage: destination reported over AIS, ETA, progress, departure port and time, arrival port and time (actual once arrived, else estimated). | 5 |

Try each one in the browser on the [MarineTraffic API page](https://maviapi.com/apis/marinetraffic?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic).

## Authentication

A client takes the key you give it. With none, it reads the `MAVIAPI_API_KEY` environment variable, and then uses the shared demo key (30 requests a minute and 300 a day per network). To get your own, [sign up](https://maviapi.com/sign-up?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic) and create a key on the [keys page](https://maviapi.com/dashboard/keys). A successful request uses the credits its endpoint lists; a failed request is free. Plans are on the [pricing page](https://maviapi.com/pricing?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic).

## Errors

A request the API answers with an error status raises an `ApiError` (in Go, returns an `*Error`) with the HTTP status, a machine-readable code and a message. In Java it carries the status and the response body.

| Status | Code | Meaning |
|---|---|---|
| 400 | `bad_request` | A parameter is missing or cannot be used (`bad_request`), or, with the `x-maviapi-strict: 1` request header, a query param the operation does not take was sent (`unknown_param`, with the names in `params`). |
| 401 | `missing_api_key` | No API key was sent, or the key is invalid or revoked (`missing_api_key`, `invalid_api_key`). |
| 402 | `credit_limit_reached` | The plan's credits for this period are used up. |
| 403 | `account_banned` | The account that owns the key is suspended. |
| 410 | `cursor_expired` | The stored copy of the list this cursor walks is gone. Start the list again without cursor. |
| 429 | `rate_limited` | Too many requests for this key (`rate_limited`), or too many at once for its plan (`concurrency_limited`). Wait the number of seconds in `Retry-After`. |
| 502 | `scrape_failed` | The source site could not be read this time. Retrying later usually works. |

## Endpoint reference

Base URL: `https://api.maviapi.com/v1/sites/marinetraffic`. API version 2026-11-28. The same contract is in [`openapi.json`](openapi.json).

### `GET /ports`

Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text, in the site's relevance order (the site returns at most about 12 matches). Each row has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or code it matched on.

Each successful request uses 5 credits.

Methods: `ports` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Ports` (Go) · `PortsAsync` (C#)

Parameters:

- `query` (string, optional): port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam" or "NLRTM". Example: `rotterdam`.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

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
    ],
    "pagination": {
      "count": 7,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-28T06:31:32.747Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /ports/{port}`

Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset in hours, alternative names, its anchorages, related ports and the site's one-paragraph summary.

Each successful request uses 5 credits.

Methods: `ports_by_port` (Python, Ruby) · `portsByPort` (JavaScript/TypeScript, PHP, Java) · `PortsByPort` (Go) · `PortsByPortAsync` (C#)

Parameters:

- `port` (string, required, in the path): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g. 2036, the port_id of /ports). Example: `NLRTM`.
- `undefined` (string, optional)

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
      "MAASDIJK"
    ],
    "anchorages": [
      {
        "port_id": "22307",
        "name": "ROTTERDAM ANCH"
      }
    ],
    "related_ports": [
      null
    ],
    "summary": "ROTTERDAM is located at UK Coast & Atlantic, Rotterdam Area in NETHERLANDS. The official UN/LOCODE of this port is NLRTM. It is also known as MAASDIJK,EUROPOORT,RDAM,DINTELHAVEN.",
    "url": "https://www.marinetraffic.com/en/ais/details/ports/2036",
    "pagination": {
      "count": 1,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-28T06:31:32.961Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /ports/{port}/vessels`

Ships currently in or near a port: every vessel the live map shows within radius_km of the port's position, nearest first, including anonymous satellite positions (name "[SAT-AIS]", `ref` null), with position, distance, speed, course, heading, AIS destination, size, deadweight and the age of the position. `complete` is false only if part of the area could not be read; `map_requests` is how many map tiles were read.

Each successful request uses 5 credits.

Methods: `ports_vessels_by_port` (Python, Ruby) · `portsVesselsByPort` (JavaScript/TypeScript, PHP, Java) · `PortsVesselsByPort` (Go) · `PortsVesselsByPortAsync` (C#)

Parameters:

- `port` (string, required, in the path): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id. Example: `NLRTM`.
- `radius_km` (number, optional): search radius around the port position, 0.5 to 15 km. Example: `5`.
- `vessel_type` (string, optional): only vessels of this map category (cargo, tanker, passenger, fishing, tug_special, high_speed, pleasure, navigation_aid, unspecified).
- `moving` (string, optional): true for only vessels moving at 1 knot or more, false for only vessels stopped or moored.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

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
    "map_requests": 16,
    "count": 182,
    "vessels": [
      {
        "ship_id": "2721357",
        "ref": "shipid:2721357",
        "name": "RVE 53",
        "flag_code": "NL",
        "vessel_type": "cargo",
        "latitude": 51.948727,
        "longitude": 4.1489549,
        "distance_km": 0.78,
        "speed_knots": 0,
        "course": null,
        "heading": null,
        "destination": null,
        "length_m": 69,
        "width_m": 7,
        "dwt": null,
        "position_age_minutes": 2,
        "timestamp": "2026-11-28T06:29:00.000Z"
      }
    ],
    "pagination": {
      "count": 182,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-28T06:31:33.947Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /track`

From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact vessel name and returns the vessel's details (`vessel`) and latest position with voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest first). `resolved` says what the text was resolved to. A name matching several vessels or ports is refused as ambiguous, with the candidates listed in the error.

Each successful request uses 5 credits.

Methods: `track` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Track` (Go) · `TrackAsync` (C#)

Parameters:

- `query` (string, optional): vessel name, IMO or MMSI (kind=vessel), or port name or UN/LOCODE (kind=port). Example: `ever given`.
- `kind` (string, optional): what to resolve the text to: vessel or port. One of: `vessel`, `port`. Example: `vessel`.
- `nearby` (integer, optional): kind=port: how many nearby vessels to include (0 to 50). Example: `10`.
- `undefined` (string, optional)

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
      "url": "https://www.marinetraffic.com/en/ais/details/ships/shipid:5630138",
      "summary": "EVER GIVEN (IMO: 9811000) is a Container Ship and is sailing under the flag of Liberia. Her length overall (LOA) is 399.94 meters and her width is 59 meters."
    },
    "position": {
      "name": "EVER GIVEN",
      "imo": "9811000",
      "mmsi": "636026627",
      "ship_id": "5630138",
      "latitude": 22.069181,
      "longitude": 114.51392,
      "speed_knots": 18.7,
      "course": 194,
      "heading": 195,
      "rate_of_turn": 0,
      "draught_m": 15.2,
      "status": "Underway using Engine",
      "area": "South China",
      "timestamp": "2026-11-28T06:29:11.000Z",
      "position_age_minutes": 2,
      "received_by": "Roaming",
      "in_range": true,
      "destination": "SGSGP",
      "eta": "2026-12-01T02:00:00.000Z",
      "voyage_progress_pct": 2.34,
      "departure_port": {
        "port_id": "1006",
        "name": "YANTIAN",
        "unlocode": "CNYTN",
        "country_code": "CN"
      },
      "departure_time": "2026-11-28T03:51:00.000Z",
      "arrival_port": {
        "port_id": "290",
        "name": "SINGAPORE",
        "unlocode": "SGSIN",
        "country_code": "SG"
      },
      "arrival_time": "2026-12-01T02:00:00.000Z",
      "arrival_time_kind": "estimated"
    },
    "fetched_at": "2026-11-28T06:31:34.224Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /vessels`

Vessels whose name (current or former), IMO or MMSI matches the text, in the site's relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign, flag, type, market, size class, length and width, plus the name or number it matched on.

Each successful request uses 5 credits.

Methods: `vessels` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Vessels` (Go) · `VesselsAsync` (C#)

Parameters:

- `query` (string, optional): vessel name (at least 3 characters), IMO number or MMSI. Example: `ever given`.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

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
    ],
    "pagination": {
      "count": 1,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-28T06:31:33.151Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /vessels/{imo}`

Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type, AIS type, commercial market and size class, length and width, AIS class, home port and the site's summary sentence. Build year is not public and is not returned.

Each successful request uses 5 credits.

Methods: `vessels_by_imo` (Python, Ruby) · `vesselsByImo` (JavaScript/TypeScript, PHP, Java) · `VesselsByImo` (Go) · `VesselsByImoAsync` (C#)

Parameters:

- `imo` (string, required, in the path): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the `ref` of a list row, for vessels with no IMO). Example: `9811000`.
- `undefined` (string, optional)

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
    "summary": "EVER GIVEN (IMO: 9811000) is a Container Ship and is sailing under the flag of Liberia. Her length overall (LOA) is 399.94 meters and her width is 59 meters.",
    "fetched_at": "2026-11-28T06:31:33.414Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /vessels/{imo}/position`

Latest AIS position of one vessel (latitude/longitude, speed in knots, course, heading, rate of turn, draught, navigational status, sea area, report time in UTC and its age, reception type) with its voyage: destination reported over AIS, ETA, progress, departure port and time, arrival port and time (actual once arrived, else estimated).

Each successful request uses 5 credits.

Methods: `vessels_position_by_imo` (Python, Ruby) · `vesselsPositionByImo` (JavaScript/TypeScript, PHP, Java) · `VesselsPositionByImo` (Go) · `VesselsPositionByImoAsync` (C#)

Parameters:

- `imo` (string, required, in the path): 7-digit IMO number, 9-digit MMSI, or shipid:<id>. Example: `9811000`.
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "name": "EVER GIVEN",
    "imo": "9811000",
    "mmsi": "636026627",
    "ship_id": "5630138",
    "latitude": 22.069181,
    "longitude": 114.51392,
    "speed_knots": 18.7,
    "course": 194,
    "heading": 195,
    "rate_of_turn": 0,
    "draught_m": 15.2,
    "status": "Underway using Engine",
    "area": "South China",
    "timestamp": "2026-11-28T06:29:11.000Z",
    "position_age_minutes": 2,
    "received_by": "Roaming",
    "in_range": true,
    "destination": "SGSGP",
    "eta": "2026-12-01T02:00:00.000Z",
    "voyage_progress_pct": 2.34,
    "departure_port": {
      "port_id": "1006",
      "name": "YANTIAN",
      "unlocode": "CNYTN",
      "country_code": "CN"
    },
    "departure_time": "2026-11-28T03:51:00.000Z",
    "arrival_port": {
      "port_id": "290",
      "name": "SINGAPORE",
      "unlocode": "SGSIN",
      "country_code": "SG"
    },
    "arrival_time": "2026-12-01T02:00:00.000Z",
    "arrival_time_kind": "estimated",
    "fetched_at": "2026-11-28T06:31:33.773Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "fetched_at": null,
  "age": null
}
```

</details>

## More

- [MarineTraffic API page](https://maviapi.com/apis/marinetraffic?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic): live examples and the changelog.
- [OpenAPI document](https://api.maviapi.com/v1/apis/marinetraffic/openapi.json) and [Postman collection](https://api.maviapi.com/v1/apis/marinetraffic/postman.json).
- [maviapi MCP server](https://maviapi.com/docs#mcp): the same API as tools for Claude, Cursor and other AI agents.
- [All maviapi APIs](https://maviapi.com/apis?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic). Need a website that is not there? [Ask for it](https://maviapi.com/?utm_source=github&utm_medium=readme&utm_campaign=sdk-marinetraffic) and get an API for it.

Other unofficial SDKs: [Airbnb](https://github.com/maviapi-sdks/airbnb-unofficial-sdk) · [Booking.com](https://github.com/maviapi-sdks/booking-unofficial-sdk) · [FlightList](https://github.com/maviapi-sdks/flightlist-unofficial-sdk) · [GetYourGuide](https://github.com/maviapi-sdks/getyourguide-unofficial-sdk) · [Google Search](https://github.com/maviapi-sdks/google-search-unofficial-sdk) · [Kiwi.com](https://github.com/maviapi-sdks/kiwi-unofficial-sdk) · [Madrid Cultural Agenda](https://github.com/maviapi-sdks/madrid-cultural-agenda-unofficial-sdk) · [Speedtest](https://github.com/maviapi-sdks/speedtest-unofficial-sdk) · [Trainline](https://github.com/maviapi-sdks/trainline-unofficial-sdk) · [Trendyol](https://github.com/maviapi-sdks/trendyol-unofficial-sdk) · [Tripadvisor](https://github.com/maviapi-sdks/tripadvisor-unofficial-sdk) · [Yemeksepeti](https://github.com/maviapi-sdks/yemeksepeti-unofficial-sdk)

## License

MIT. See [LICENSE](LICENSE).
