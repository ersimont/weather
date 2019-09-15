import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractSource } from "./abstract-source";
import { GpsCoords } from "../gps-coords.service";
import { SourceId } from "../state/source";
import { Forecast } from "../state/forecast";
import { Condition, Conditions } from "../state/condition";

@Injectable({ providedIn: "root" })
export class WeatherGov extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.WEATHER_GOV, injector);
  }

  async fetch(gpsCoords: [number, number]) {
    // try {
    const pointRes = await this.fetchPoint(gpsCoords);
    const zoneRes = await this.fetchZone(pointRes.properties);
    return extractForecast(zoneRes.properties);
    // } catch (ex) {
    //   if (
    //     get(ex, ["error", "type"]) ===
    //     "https://api.weather.gov/problems/InvalidPoint"
    //   ) {
    //     return { city: "Not available at this location" };
    //   } else {
    //     throw ex;
    //   }
    // }
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
  addFromZone(forecast, zone, Condition.TEMP, "temperature");
  addFromZone(forecast, zone, Condition.FEEL, "apparentTemperature");
  addFromZone(forecast, zone, Condition.DEW, "dewpoint");
  addFromZone(forecast, zone, Condition.CHANCE, "probabilityOfPrecipitation");
  addFromZone(forecast, zone, Condition.AMOUNT, "quantitativePrecipitation");
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
    const timestamp = new Date(v.validTime.split("/")[0]).getTime();
    let conditions: Conditions = forecast[timestamp];
    if (!conditions) {
      conditions = forecast[timestamp] = {};
    }
    conditions[condition] = v.value;
  }
}
