import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { PresentableError } from "app/services/error.service";
import { AbstractSource } from "app/sources/abstract-source";
import { Condition, Conditions } from "app/state/condition";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { SourceId } from "app/state/source";
import { get } from "micro-dash";
import { duration } from "moment";

@Injectable({ providedIn: "root" })
export class WeatherGov extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.WEATHER_GOV, injector);
  }

  async fetch(gpsCoords: [number, number]) {
    try {
      const pointRes = await this.fetchPoint(gpsCoords);
      const zoneRes = await this.fetchZone(pointRes.properties);
      return extractForecast(zoneRes.properties);
    } catch (ex) {
      if (
        get(ex, ["error", "type"]) ===
        "https://api.weather.gov/problems/InvalidPoint"
      ) {
        throw new PresentableError(
          "Weather.gov is not available here. Try another source (in the settings).",
        );
      } else {
        throw ex;
      }
    }
  }

  private fetchPoint(gpsCoords: GpsCoords) {
    return this.httpClient
      .get<any>(`https://api.weather.gov/points/${gpsCoords.join(",")}`)
      .toPromise();
  }

  private fetchZone(point: any) {
    return this.httpClient.get<any>(point.forecastGridData).toPromise();
  }
}

function extractForecast(zone: any) {
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
  zone: any,
  condition: Condition,
  zoneKey: string,
) {
  for (const v of zone[zoneKey].values) {
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
