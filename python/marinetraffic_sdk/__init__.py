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

    def ports(self, *, query: str, limit: Optional[int] = None, offset: Optional[int] = None, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
        UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
        has no paging.

        Each successful request uses 10 credits for every 12 rows it returns (at least 10
        credits).

        Parameters:
          query (string, required): Port name (at least 3 characters) or UN/LOCODE
          limit (integer): Rows per page (default 50, max 200)
          offset (integer): Rows to skip
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/ports", {"query": query, "limit": limit, "offset": offset, "refresh": refresh})

    def ports_by_port(self, *, port: str, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
        other names and its anchorages.

        Each successful request uses 10 credits.

        Parameters:
          port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
            2036, the port_id of /ports)
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/ports/{port}", {"port": port, "refresh": refresh})

    def ports_vessels_by_port(self, *, port: str, radius_km: Optional[float] = None, vessel_type: Optional[str] = None, moving: Optional[bool] = None, limit: Optional[int] = None, offset: Optional[int] = None, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        Ships currently in or near a port: every vessel the live map shows within radius_km
        of the port's position, nearest first, with position, speed, course, destination and
        size. `complete` is false only if part of the area could not be read.

        Each successful request uses 10 credits.

        Parameters:
          port (string, required): UN/LOCODE or MarineTraffic port id
          radius_km (number): Search radius around the port position, 0.5 to 15 km
          vessel_type (string): Only vessels of this map category. One of: cargo, tanker,
            passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
            unspecified
          moving (boolean): true: only vessels moving at 1 knot or more; false: only
            vessels stopped or moored
          limit (integer): Rows per page (default 50, max 200)
          offset (integer): Rows to skip
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/ports/{port}/vessels", {"port": port, "radius_km": radius_km, "vessel_type": vessel_type, "moving": moving, "limit": limit, "offset": offset, "refresh": refresh})

    def track(self, *, query: str, kind: Optional[str] = None, nearby: Optional[int] = None, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
        exact vessel name and returns its details and latest position. kind=port: resolves a
        UN/LOCODE or exact port name and returns its details and the nearest vessels within
        5 km. An ambiguous name answers 400 with candidates.

        Each successful request uses 10 credits.

        Parameters:
          query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
          kind (string): What to resolve the text to. One of: vessel, port
          nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/track", {"query": query, "kind": kind, "nearby": nearby, "refresh": refresh})

    def vessels(self, *, query: str, limit: Optional[int] = None, offset: Optional[int] = None, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
        call sign, flag, type, size). The site returns at most 12 matches per query and has
        no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.

        Each successful request uses 10 credits for every 12 rows it returns (at least 10
        credits).

        Parameters:
          query (string, required): Vessel name (at least 3 characters), IMO number or
            MMSI
          limit (integer): Rows per page (default 50, max 200)
          offset (integer): Rows to skip
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/vessels", {"query": query, "limit": limit, "offset": offset, "refresh": refresh})

    def vessels_by_imo(self, *, imo: str, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
        market and size class, length and width. Build year is not public on the site (login
        only) and is not returned.

        Each successful request uses 10 credits.

        Parameters:
          imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
            `ref` of a list row, for vessels with no IMO)
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/vessels/{imo}", {"imo": imo, "refresh": refresh})

    def vessels_position_by_imo(self, *, imo: str, refresh: Optional[bool] = None) -> Dict[str, Any]:
        """
        Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
        status, time of report) with its voyage: reported destination, ETA, departure and
        arrival ports.

        Each successful request uses 10 credits.

        Parameters:
          imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
          refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
            minutes)
        """
        return self._get("/vessels/{imo}/position", {"imo": imo, "refresh": refresh})

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
