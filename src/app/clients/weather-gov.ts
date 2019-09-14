import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractClient, Conditions, Forecast } from "./abstract-client";
import { GpsCoords } from "../gps-coords.service";

@Injectable({ providedIn: "root" })
export class WeatherGov extends AbstractClient {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(injector);
  }

  async fetch(gpsCoords: [number, number]): Promise<Forecast> {
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
  addFromZone(forecast, zone, "temperature");
  addFromZone(forecast, zone, "apparentTemperature");
  addFromZone(forecast, zone, "dewPoint", "dewpoint");
  addFromZone(
    forecast,
    zone,
    "chanceOfPrecipitation",
    "probabilityOfPrecipitation",
  );
  addFromZone(
    forecast,
    zone,
    "amountOfPrecipitation",
    "quantitativePrecipitation",
  );
  addFromZone(forecast, zone, "windSpeed");
  return forecast;
}

function addFromZone(
  forecast: Forecast,
  zone: any,
  forecastKey: keyof Conditions,
  zoneKey: string = forecastKey,
) {
  for (const v of zone[zoneKey].values) {
    const timestamp = new Date(v.validTime.split("/")[0]).getTime();
    let conditions: Conditions = forecast[timestamp];
    if (!conditions) {
      conditions = forecast[timestamp] = {};
    }
    conditions[forecastKey] = v.value;
  }
}
