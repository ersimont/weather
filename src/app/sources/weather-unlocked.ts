import { AbstractSource, Forecast } from "./abstract-source";
import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";

const APP_ID = "b08df994";
const APP_KEY = "1fecb6d4e7a5696a9adbfc19c7baef8c";

@Injectable({ providedIn: "root" })
export class WeatherUnlocked extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(injector);
  }

  async fetch(gpsCoords: [number, number]): Promise<Forecast> {
    const res = await this.fetchRes(gpsCoords);
    console.log({ res });
    const forecast: Forecast = {};
    for (const day of res.Days) {
      for (const timeframe of day.Timeframes) {
        addConditions(forecast, timeframe);
      }
    }
    console.log({ forecast });
    return forecast;
  }

  private fetchRes(gpsCoords: [number, number]) {
    return this.httpClient
      .get<any>(
        `http://api.weatherunlocked.com/api/forecast/${gpsCoords.join(
          ",",
        )}?app_id=${APP_ID}&app_key=${APP_KEY}`,
      )
      .toPromise();
  }
}

function addConditions(forecast: Forecast, timeframe: any) {
  forecast[parseTimestamp(timeframe)] = {
    temperature: timeframe.temp_c,
    apparentTemperature: timeframe.feelslike_c,
    dewPoint: timeframe.dewpoint_c,
    windSpeed: timeframe.windspeed_kts,
    chanceOfPrecipitation: parsePercentage(timeframe.prob_precip_pct),
    amountOfPrecipitation: timeframe.precip_mm,
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
