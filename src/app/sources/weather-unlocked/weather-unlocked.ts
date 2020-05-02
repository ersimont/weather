import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { AbstractSource } from "app/sources/abstract-source";
import { Condition } from "app/state/condition";
import { Forecast } from "app/state/forecast";
import { GpsCoords } from "app/state/location";
import { SourceId } from "app/state/source";
import { round } from "micro-dash";
import { map } from "rxjs/operators";

const endpoint =
  "https://us-central1-proxic.cloudfunctions.net/api/weather-unlocked/api/forecast";

export interface ForecastResponse {
  Days: Array<{ Timeframes: Timeframe[] }>;
}

export interface Timeframe {
  utcdate: string;
  utctime: number;
  precip_mm: number;
  cloudtotal_pct: number;
  dewpoint_c: number;
  feelslike_c: number;
  temp_c: number;
  windspd_kts: number;
}

@Injectable({ providedIn: "root" })
export class WeatherUnlocked extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.WEATHER_UNLOCKED, injector);
  }

  fetch(gpsCoords: GpsCoords) {
    return this.fetchRes(gpsCoords).pipe(
      map((res) => {
        const forecast: Forecast = {};
        for (const day of res.Days) {
          for (const timeframe of day.Timeframes) {
            addConditions(forecast, timeframe);
          }
        }
        return forecast;
      }),
    );
  }

  private fetchRes(gpsCoords: GpsCoords) {
    return this.httpClient.get<ForecastResponse>(
      `${endpoint}/${gpsCoords.map((coord) => round(coord, 3)).join(",")}`,
    );
  }
}

function addConditions(forecast: Forecast, timeframe: Timeframe) {
  forecast[parseTimestamp(timeframe)] = {
    [Condition.AMOUNT]: timeframe.precip_mm / 3,
    [Condition.CLOUD]: timeframe.cloudtotal_pct,
    [Condition.DEW]: timeframe.dewpoint_c,
    [Condition.FEEL]: timeframe.feelslike_c,
    [Condition.TEMP]: timeframe.temp_c,
    [Condition.WIND]: timeframe.windspd_kts,
  };
}

function parseTimestamp(timeframe: Timeframe) {
  const [day, month, year] = timeframe.utcdate.split("/");
  const hour = timeframe.utctime / 100;
  return Date.UTC(+year, +month - 1, +day, hour);
}
