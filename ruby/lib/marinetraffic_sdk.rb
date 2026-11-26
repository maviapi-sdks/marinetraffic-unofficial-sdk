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

    # Search ports, anchorages and offshore terminals by name or UN/LOCODE, with country,
    # UN/LOCODE and coordinates. The site returns at most about 12 matches per query and
    # has no paging.
    #
    # Each successful request uses 10 credits for every 12 rows it returns (at least 10
    # credits).
    #
    # Parameters:
    #   query (string, required): Port name (at least 3 characters) or UN/LOCODE
    #   limit (integer): Rows per page (default 50, max 200)
    #   offset (integer): Rows to skip
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
    def ports(**params)
      get("/ports", params, %w[query])
    end

    # Details of one port: name, UN/LOCODE, country, type, size, coordinates, time zone,
    # other names and its anchorages.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   port (string, required): UN/LOCODE (e.g. NLRTM) or MarineTraffic port id (e.g.
    #     2036, the port_id of /ports)
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
    def ports_by_port(**params)
      get("/ports/{port}", params, %w[port])
    end

    # Ships currently in or near a port: every vessel the live map shows within radius_km
    # of the port's position, nearest first, with position, speed, course, destination and
    # size. `complete` is false only if part of the area could not be read.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   port (string, required): UN/LOCODE or MarineTraffic port id
    #   radius_km (number): Search radius around the port position, 0.5 to 15 km
    #   vessel_type (string): Only vessels of this map category. One of: cargo, tanker,
    #     passenger, fishing, tug_special, high_speed, pleasure, navigation_aid,
    #     unspecified
    #   moving (boolean): true: only vessels moving at 1 knot or more; false: only
    #     vessels stopped or moored
    #   limit (integer): Rows per page (default 50, max 200)
    #   offset (integer): Rows to skip
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
    def ports_vessels_by_port(**params)
      get("/ports/{port}/vessels", params, %w[port])
    end

    # One call from free text to the live picture. kind=vessel: resolves an IMO, MMSI or
    # exact vessel name and returns its details and latest position. kind=port: resolves a
    # UN/LOCODE or exact port name and returns its details and the nearest vessels within
    # 5 km. An ambiguous name answers 400 with candidates.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   query (string, required): Vessel name/IMO/MMSI, or port name/UN/LOCODE
    #   kind (string): What to resolve the text to. One of: vessel, port
    #   nearby (integer): kind=port: how many nearby vessels to include (0 to 50)
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
    def track(**params)
      get("/track", params, %w[query])
    end

    # Search vessels by name, IMO or MMSI. Each match carries its particulars (IMO, MMSI,
    # call sign, flag, type, size). The site returns at most 12 matches per query and has
    # no paging: use a fuller name, or the IMO/MMSI, to reach a specific vessel.
    #
    # Each successful request uses 10 credits for every 12 rows it returns (at least 10
    # credits).
    #
    # Parameters:
    #   query (string, required): Vessel name (at least 3 characters), IMO number or
    #     MMSI
    #   limit (integer): Rows per page (default 50, max 200)
    #   offset (integer): Rows to skip
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
    def vessels(**params)
      get("/vessels", params, %w[query])
    end

    # Registry details of one vessel: name, IMO, MMSI, call sign, flag, type, commercial
    # market and size class, length and width. Build year is not public on the site (login
    # only) and is not returned.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id> (the
    #     `ref` of a list row, for vessels with no IMO)
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
    def vessels_by_imo(**params)
      get("/vessels/{imo}", params, %w[imo])
    end

    # Latest AIS position of one vessel (lat/lon, speed, course, heading, navigational
    # status, time of report) with its voyage: reported destination, ETA, departure and
    # arrival ports.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   imo (string, required): 7-digit IMO number, 9-digit MMSI, or shipid:<id>
    #   refresh (boolean): Bypass and repopulate the cache (answers are cached for 5
    #     minutes)
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
