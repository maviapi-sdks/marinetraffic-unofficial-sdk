# frozen_string_literal: true

# Unofficial MarineTraffic API client for Ruby.
# Not affiliated with MarineTraffic. Endpoint reference: https://maviapi.com/apis/marinetraffic

require "json"
require "net/http"
require "uri"

module MarinetrafficSdk
  VERSION = "0.1.0"
  DEMO_KEY = "mvk_test_playground_5f3c1a8d"

  # An error status answered by the API.
  class ApiError < StandardError
    attr_reader :status, :code

    def initialize(status, code, message)
      super("#{status} #{code}: #{message}")
      @status = status
      @code = code
    end
  end

  class Client
    # With no api_key it uses the MAVIAPI_API_KEY environment variable, then the
    # shared demo key.
    def initialize(api_key: nil, base_url: nil, timeout: 120)
      given = ->(*values) { values.find { |value| value && !value.empty? } }
      @api_key = given.call(api_key, ENV["MAVIAPI_API_KEY"], DEMO_KEY)
      root = given.call(base_url, ENV["MAVIAPI_BASE_URL"], "https://api.maviapi.com")
      @base_url = root.sub(%r{/+\z}, "") + "/v1/sites/marinetraffic"
      @timeout = timeout
    end

    # Ports, anchorages and offshore terminals whose name or UN/LOCODE matches the text,
    # in the site's relevance order (the site returns at most about 12 matches). Each row
    # has the port id, name, type, country, UN/LOCODE, coordinates, size and the name or
    # code it matched on.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   query (string): port name (at least 3 characters) or UN/LOCODE, e.g. "rotterdam"
    #     or "NLRTM"
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def ports(**params)
      get("/ports", params, %w[])
    end

    # Details of one port: name, UN/LOCODE, country, type, size, coordinates, UTC offset
    # in hours, alternative names, its anchorages, related ports and the site's
    # one-paragraph summary.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
    #     2036, the port_id of /ports)
    #   undefined (string)
    def ports_by_port(**params)
      get("/ports/{port}", params, %w[port])
    end

    # Ships currently in or near a port: every vessel the live map shows within radius_km
    # of the port's position, nearest first, including anonymous satellite positions (name
    # "[SAT-AIS]", `ref` null), with position, distance, speed, course, heading, AIS
    # destination, size, deadweight and the age of the position. `complete` is false only
    # if part of the area could not be read; `map_requests` is how many map tiles were
    # read.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id
    #   radius_km (number): search radius around the port position, 0.5 to 15 km
    #   vessel_type (string): only vessels of this map category (cargo, tanker,
    #     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
    #     unspecified)
    #   moving (string): true for only vessels moving at 1 knot or more, false for only
    #     vessels stopped or moored
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def ports_vessels_by_port(**params)
      get("/ports/{port}/vessels", params, %w[port])
    end

    # From free text to the live picture. kind=vessel: resolves an IMO, MMSI or exact
    # vessel name and returns the vessel's details (`vessel`) and latest position with
    # voyage (`position`). kind=port: resolves a UN/LOCODE or exact port name and returns
    # the port's details (`port`) and the nearest vessels within 5 km (`vessels`, nearest
    # first). `resolved` says what the text was resolved to. A name matching several
    # vessels or ports is refused as ambiguous, with the candidates listed in the error.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   query (string): vessel name, IMO or MMSI (kind=vessel), or port name or
    #     UN/LOCODE (kind=port)
    #   kind (string): what to resolve the text to: vessel or port. One of: vessel, port
    #   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
    #   undefined (string)
    def track(**params)
      get("/track", params, %w[])
    end

    # Vessels whose name (current or former), IMO or MMSI matches the text, in the site's
    # relevance order (at most 12; use a fuller name or the IMO/MMSI to reach a specific
    # vessel). Each row carries the vessel's particulars: ship id, IMO, MMSI, call sign,
    # flag, type, market, size class, length and width, plus the name or number it matched
    # on.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   query (string): vessel name (at least 3 characters), IMO number or MMSI
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def vessels(**params)
      get("/vessels", params, %w[])
    end

    # Registry details of one vessel: name, AIS name, IMO, MMSI, call sign, flag, type,
    # AIS type, commercial market and size class, length and width, AIS class, home port
    # and the site's summary sentence. Build year is not public and is not returned.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
    #     `ref` of a list row, for vessels with no IMO)
    #   undefined (string)
    def vessels_by_imo(**params)
      get("/vessels/{imo}", params, %w[imo])
    end

    # Latest AIS position of one vessel (latitude/longitude, speed in knots, course,
    # heading, rate of turn, draught, navigational status, sea area, report time in UTC
    # and its age, reception type) with its voyage: destination reported over AIS, ETA,
    # progress, departure port and time, arrival port and time (actual once arrived, else
    # estimated).
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
    #   undefined (string)
    def vessels_position_by_imo(**params)
      get("/vessels/{imo}/position", params, %w[imo])
    end

    private

    def get(path, params, required)
      params = params.transform_keys(&:to_s)
      missing = required.find { |name| params[name].nil? }
      raise ArgumentError, "missing required parameter: #{missing}" if missing

      query = {}
      params.each do |name, value|
        next if value.nil?

        token = "{#{name}}"
        if path.include?(token)
          path = path.sub(token, URI.encode_www_form_component(value.to_s).gsub("+", "%20"))
        else
          query[name] = value.to_s
        end
      end
      uri = URI(@base_url + path)
      uri.query = URI.encode_www_form(query) unless query.empty?
      request = Net::HTTP::Get.new(uri)
      request["Authorization"] = "Bearer #{@api_key}"
      request["Accept"] = "application/json"
      request["User-Agent"] = "marinetraffic-unofficial-sdk/0.1.0 (ruby)"
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https", read_timeout: @timeout) do |http|
        http.request(request)
      end
      data = begin
        JSON.parse(response.body.to_s)
      rescue JSON::ParserError
        nil
      end
      return data if response.is_a?(Net::HTTPSuccess)

      detail = data.is_a?(Hash) ? data : {}
      raise ApiError.new(response.code.to_i, detail["error"] || "http_error", detail["message"] || response.body.to_s[0, 200])
    end
  end
end
