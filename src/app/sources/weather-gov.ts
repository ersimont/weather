import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractSource, notAvailableHere } from "app/sources/abstract-source";
import { Condition, Conditions } from "app/state/condition";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { SourceId } from "app/state/source";
import { get } from "micro-dash";
import { duration } from "moment";

export interface PointResponse {
  properties: { forecastGridData: string };
}

export interface GridResponse {
  properties: {
    quantitativePrecipitation: GridConditionInfo;
    skyCover: GridConditionInfo;
    dewpoint: GridConditionInfo;
    apparentTemperature: GridConditionInfo;
    temperature: GridConditionInfo;
    windSpeed: GridConditionInfo;
  };
}

interface GridConditionInfo {
  values: Array<{ validTime: string; value: number }>;
}

@Injectable({ providedIn: "root" })
export class WeatherGov extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.WEATHER_GOV, injector);
  }

  async fetch(gpsCoords: [number, number]) {
    try {
      const pointResponse = await this.fetchPoint(gpsCoords);
      const zoneResponse = await this.fetchZone(pointResponse);
      return extractForecast(zoneResponse);
    } catch (ex) {
      if (
        get(ex, ["error", "type"]) ===
        "https://api.weather.gov/problems/InvalidPoint"
      ) {
        return Promise.reject(notAvailableHere);
      } else {
        throw ex;
      }
    }
  }

  private fetchPoint(gpsCoords: GpsCoords) {
    return this.httpClient
      .get<PointResponse>(
        `https://api.weather.gov/points/${gpsCoords.join(",")}`,
      )
      .toPromise();
  }

  private fetchZone(point: PointResponse) {
    return this.httpClient
      .get<GridResponse>(point.properties.forecastGridData)
      .toPromise();
  }
}

function extractForecast(zone: GridResponse) {
  const forecast: Forecast = {};
  addFromZone(forecast, zone, Condition.AMOUNT, "quantitativePrecipitation");
  addFromZone(forecast, zone, Condition.CLOUD, "skyCover");
  addFromZone(forecast, zone, Condition.DEW, "dewpoint");
  addFromZone(forecast, zone, Condition.FEEL, "apparentTemperature");
  addFromZone(forecast, zone, Condition.TEMP, "temperature");
  addFromZone(forecast, zone, Condition.WIND, "windSpeed");
  return forecast;
}

function addFromZone(
  forecast: Forecast,
  zone: GridResponse,
  condition: Condition,
  zoneKey: keyof GridResponse["properties"],
) {
  for (const v of zone.properties[zoneKey].values) {
    const [timeString, durationString] = v.validTime.split("/");
    const time = new Date(timeString).getTime();

    let value = v.value;
    if (condition === Condition.AMOUNT) {
      value /= duration(durationString).asHours();
    }

    let conditions: Conditions = forecast[time];
    if (!conditions) {
      conditions = forecast[time] = {};
    }
    conditions[condition] = value;
  }
}
