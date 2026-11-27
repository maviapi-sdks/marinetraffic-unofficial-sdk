"""Unofficial MarineTraffic API client for Python.

Vessel and port data from MarineTraffic: search vessels by name, IMO or MMSI; vessel particulars; latest AIS position and voyage (destination, ETA); port search and details; and the ships in or near a port.

Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

__version__ = "0.1.0"
__all__ = ["MarinetrafficClient", "ApiError", "DEMO_KEY"]

DEMO_KEY = "mvk_test_playground_5f3c1a8d"


class ApiError(Exception):
    """An error status answered by the API."""

    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.message = message


class MarinetrafficClient:
    """MarineTraffic API client.

    With no api_key it uses the MAVIAPI_API_KEY environment variable, then the
    shared demo key.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: Optional[str] = None,
        timeout: float = 120.0,
    ) -> None:
        self.api_key = api_key or os.environ.get("MAVIAPI_API_KEY") or DEMO_KEY
        root = base_url or os.environ.get("MAVIAPI_BASE_URL") or "https://api.maviapi.com"
        self.base_url = root.rstrip("/") + "/v1/sites/marinetraffic"
        self.timeout = timeout

    def ports(self, *, query: Optional[str] = None, limit: Optional[int] = None, offset: Optional[int] = None, undefined: Optional[str] = None, undefined: Optional[str] = None, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
        in the site's relevance order (the site returns at most about 12 matches). Each row
        has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
        code it matched on.

        Each successful request uses 5 credits.

        Parameters:
          query (string): port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam"
            or "NLRTM"
          limit (integer): Rows in one page, 1 to 200 (default 50)
          offset (integer): Rows to skip before the page starts (default 0)
          undefined (string)
          undefined (string)
          undefined (string)
        """
        return self._get("/ports", {"query": query, "limit": limit, "offset": offset, undefined: undefined, undefined: undefined, undefined: undefined})

    def ports_by_port(self, *, port: str, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
        in hours, alternative names, its anchorages, related ports and the site's
        one-paragraph summary.

        Each successful request uses 5 credits.

        Parameters:
          port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
            2036, the port_id of /ports)
          undefined (string)
        """
        return self._get("/ports/{port}", {"port": port, undefined: undefined})

    def ports_vessels_by_port(self, *, port: str, radius_km: Optional[float] = None, vessel_type: Optional[str] = None, moving: Optional[str] = None, limit: Optional[int] = None, offset: Optional[int] = None, undefined: Optional[str] = None, undefined: Optional[str] = None, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        Ships currently in or near a port: every identified vessel the live map shows within
        radius_km of the port's position (anonymous [SAT-AIS] placeholders left out),
        nearest first, with position, distance, speed, course, heading, AIS destination,
        size, deadweight and the age of the position. `complete` is false only if part of
        the area could not be read; `map_requests` is how many map tiles were read.

        Each successful request uses 5 credits.

        Parameters:
          port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
          radius_km (number): search radius around the port position, 0.5 to 15 km
          vessel_type (string): only vessels of this map category (cargo, tanker,
            passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
            unspecified)
          moving (string): true for only vessels moving at 1 knot or more, false for only
            vessels stopped or moored
          limit (integer): Rows in one page, 1 to 200 (default 50)
          offset (integer): Rows to skip before the page starts (default 0)
          undefined (string)
          undefined (string)
          undefined (string)
        """
        return self._get("/ports/{port}/vessels", {"port": port, "radius_km": radius_km, "vessel_type": vessel_type, "moving": moving, "limit": limit, "offset": offset, undefined: undefined, undefined: undefined, undefined: undefined})

    def track(self, *, query: Optional[str] = None, kind: Optional[str] = None, nearby: Optional[int] = None, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact
        vessel name and returns the vessel's details (`vessel`) and latest position with
        voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns
        the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest
        first). `resolved` says what the text was resolved to. A name matching several
        vessels or ports is refused as ambiguous, with the candidates listed in the error.

        Each successful request uses 5 credits.

        Parameters:
          query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
            UN/LOCODE (kind=port)
          kind (string): what to resolve the text to: vessel or port. One of: vessel, port
          nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
          undefined (string)
        """
        return self._get("/track", {"query": query, "kind": kind, "nearby": nearby, undefined: undefined})

    def vessels(self, *, query: Optional[str] = None, limit: Optional[int] = None, offset: Optional[int] = None, undefined: Optional[str] = None, undefined: Optional[str] = None, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        Vessels whose name (current or former), IMO or MMSI matches the text, in the site's
        relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific
        vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign,
        flag, type, market, size class, length and width, plus the name or number it matched
        on.

        Each successful request uses 5 credits.

        Parameters:
          query (string): vessel name (at least 3 characters), IMO number or MMSI
          limit (integer): Rows in one page, 1 to 200 (default 50)
          offset (integer): Rows to skip before the page starts (default 0)
          undefined (string)
          undefined (string)
          undefined (string)
        """
        return self._get("/vessels", {"query": query, "limit": limit, "offset": offset, undefined: undefined, undefined: undefined, undefined: undefined})

    def vessels_by_imo(self, *, imo: str, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
        AIS type, commercial market and size class, length and width, AIS class, home port
        and the site's summary sentence. Build year is not public and is not returned.

        Each successful request uses 5 credits.

        Parameters:
          imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
            `ref` of a list row, for vessels with no IMO)
          undefined (string)
        """
        return self._get("/vessels/{imo}", {"imo": imo, undefined: undefined})

    def vessels_position_by_imo(self, *, imo: str, undefined: Optional[str] = None) -> Dict[str, Any]:
        """
        Latest AIS position of one vessel (latitude/longitude, speed in knots, course,
        heading, rate of turn, draught, navigational status, sea area, report time in UTC
        and its age, reception type) with its voyage: destination reported over AIS, ETA,
        progress, departure port and time, arrival port and time (actual once arrived, else
        estimated).

        Each successful request uses 5 credits.

        Parameters:
          imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
          undefined (string)
        """
        return self._get("/vessels/{imo}/position", {"imo": imo, undefined: undefined})

    def _get(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        query = {}
        for name, value in params.items():
            if value is None:
                continue
            text = str(value).lower() if isinstance(value, bool) else str(value)
            token = "{" + name + "}"
            if token in path:
                path = path.replace(token, urllib.parse.quote(text, safe=""))
            else:
                query[name] = text
        url = self.base_url + path + ("?" + urllib.parse.urlencode(query) if query else "")
        request = urllib.request.Request(
            url,
            headers={
                "Authorization": "Bearer " + self.api_key,
                "Accept": "application/json",
                "User-Agent": "marinetraffic-unofficial-sdk/0.1.0 (python)",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return json.loads(response.read())
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", "replace")
            try:
                detail = json.loads(body)
            except ValueError:
                detail = None
            if not isinstance(detail, dict):
                detail = {}
            raise ApiError(
                error.code,
                str(detail.get("error", "http_error")),
                str(detail.get("message", body[:200])),
            ) from None
