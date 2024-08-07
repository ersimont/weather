import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { convertTime } from '@s-libs/js-core';
import { calcDewPoint } from 'app/misc-utils/calc-dew-point';
import { AbstractSource } from 'app/sources/abstract-source';
import { Condition } from 'app/state/condition';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { SourceId } from 'app/state/source';
import { metersPerSecondToKnots } from 'app/state/units';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// API docs:
// https://openweathermap.org/forecast5

const endpoint =
  'https://us-central1-proxic.cloudfunctions.net/api/openweathermap/data/2.5/forecast';

export interface ForecastResponse {
  list: Timeframe[];
}

export interface Timeframe {
  clouds: { all: number };
  dt: number;
  main: {
    feels_like: number;
    humidity: number;
    temp: number;
  };
  rain?: {
    /** Rain volume for last 3 hours, mm */
    '3h': number;
  };
  snow?: {
    /** Snow volume for last 3 hours */
    '3h': number;
  };
  wind: {
    /** meter/sec */
    speed: number;
  };
}

@Injectable({ providedIn: 'root' })
export class OpenWeather extends AbstractSource {
  #httpClient = inject(HttpClient);

  constructor() {
    super(SourceId.OPEN_WEATHER);
  }

  protected fetch(gpsCoords: GpsCoords): Observable<Forecast> {
    return this.fetchForecast(gpsCoords).pipe(map(extractForecast));
  }

  private fetchForecast(gpsCoords: GpsCoords): Observable<ForecastResponse> {
    return this.#httpClient.get<ForecastResponse>(endpoint, {
      params: {
        lat: gpsCoords[0].toString(),
        lon: gpsCoords[1].toString(),
        units: 'metric',
      },
    });
  }
}

function extractForecast(response: ForecastResponse): Forecast {
  const forecast: Forecast = {};
  for (const timeframe of response.list) {
    const time = timeframe.dt * 1000;
    // rain & snow are for the _previous_ 3 hours
    forecast[time - convertTime(1.5, 'hr', 'ms')] = {
      [Condition.AMOUNT]: extractAmount(timeframe) / 3,
    };
    forecast[time] = {
      [Condition.CLOUD]: timeframe.clouds.all,
      [Condition.DEW]: extractDew(timeframe),
      [Condition.FEEL]: timeframe.main.feels_like,
      [Condition.TEMP]: timeframe.main.temp,
      [Condition.WIND]: metersPerSecondToKnots(timeframe.wind.speed),
    };
  }
  return forecast;
}

function extractAmount(timeframe: Timeframe): number {
  return timeframe.rain?.['3h'] || timeframe.snow?.['3h'] || 0;
}

function extractDew(timeframe: Timeframe): number {
  return calcDewPoint(timeframe.main.temp, timeframe.main.humidity);
}
