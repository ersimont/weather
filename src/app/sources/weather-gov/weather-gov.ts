import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractSource, notAvailableHere } from "app/sources/abstract-source";
import { Condition, Conditions } from "app/state/condition";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { SourceId } from "app/state/source";
import { get } from "micro-dash";
import { duration } from "moment";
import { throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

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

  fetch(gpsCoords: [number, number]) {
    return this.fetchPoint(gpsCoords).pipe(
      switchMap((pointResponse) => this.fetchZone(pointResponse)),
      map(extractForecast),
      catchError((err) => {
        if (
          get(err, ["error", "type"]) ===
          "https://api.weather.gov/problems/InvalidPoint"
        ) {
          return throwError(notAvailableHere);
        } else {
          return throwError(err);
        }
      }),
    );
  }

  private fetchPoint(gpsCoords: GpsCoords) {
    return this.httpClient.get<PointResponse>(
      `https://api.weather.gov/points/${gpsCoords.join(",")}`,
    );
  }

  private fetchZone(point: PointResponse) {
    return this.httpClient.get<GridResponse>(point.properties.forecastGridData);
  }
}

function extractForecast(gridResponse: GridResponse) {
  const forecast: Forecast = {};
  addFromZone(
    forecast,
    gridResponse,
    Condition.AMOUNT,
    "quantitativePrecipitation",
  );
  addFromZone(forecast, gridResponse, Condition.CLOUD, "skyCover");
  addFromZone(forecast, gridResponse, Condition.DEW, "dewpoint");
  addFromZone(forecast, gridResponse, Condition.FEEL, "apparentTemperature");
  addFromZone(forecast, gridResponse, Condition.TEMP, "temperature");
  addFromZone(forecast, gridResponse, Condition.WIND, "windSpeed");
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
