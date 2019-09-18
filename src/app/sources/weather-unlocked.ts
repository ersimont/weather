import { AbstractSource } from "./abstract-source";
import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Forecast } from "../state/forecast";
import { SourceId } from "../state/source";
import { Condition } from "../state/condition";

const endpoint =
  "https://us-central1-proxic.cloudfunctions.net/weather-unlocked/api/forecast";

@Injectable({ providedIn: "root" })
export class WeatherUnlocked extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.WEATHER_UNLOCKED, injector);
  }

  async fetch(gpsCoords: [number, number]): Promise<Forecast> {
    const res = await this.fetchRes(gpsCoords);
    const forecast: Forecast = {};
    for (const day of res.Days) {
      for (const timeframe of day.Timeframes) {
        addConditions(forecast, timeframe);
      }
    }
    return forecast;
  }

  private fetchRes(gpsCoords: [number, number]) {
    return this.httpClient
      .get<any>(`${endpoint}/${gpsCoords.join(",")}`)
      .toPromise();
  }
}

function addConditions(forecast: Forecast, timeframe: any) {
  forecast[parseTimestamp(timeframe)] = {
    [Condition.TEMP]: timeframe.temp_c,
    [Condition.FEEL]: timeframe.feelslike_c,
    [Condition.DEW]: timeframe.dewpoint_c,
    [Condition.WIND]: timeframe.windspd_kts,
    [Condition.CHANCE]: parsePercentage(timeframe.prob_precip_pct),
    [Condition.AMOUNT]: timeframe.precip_mm,
  };
}

function parseTimestamp(timeframe: any) {
  const [day, month, year] = timeframe.utcdate.split("/");
  const hour = timeframe.utctime / 100;
  return Date.UTC(year, month - 1, day, hour);
}

function parsePercentage(asString: string) {
  if (asString === "<1") {
    return 0;
  } else {
    return parseInt(asString, 10);
  }
}
