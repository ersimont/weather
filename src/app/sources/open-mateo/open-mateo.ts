import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { convertTime } from '@s-libs/js-core';
import { AbstractSource } from 'app/sources/abstract-source';
import { Condition } from 'app/state/condition';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { SourceId } from 'app/state/source';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// API docs:
// https://open-meteo.com/en/docs

// TODO: make fallback (or default?)
const endpoint = 'https://api.open-meteo.com/v1/forecast';

export interface ForecastResponse {
  hourly: {
    time: number[];
    temperature_2m: number[];
    dew_point_2m: number[];
    apparent_temperature: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    cloud_cover: number[];
  };
}

@Service()
export class OpenMateo extends AbstractSource {
  readonly #httpClient = inject(HttpClient);

  constructor() {
    super(SourceId.OPEN_MATEO);
  }

  protected fetch(gpsCoords: GpsCoords): Observable<Forecast> {
    return this.#fetchForecast(gpsCoords).pipe(map(extractForecast));
  }

  #fetchForecast(gpsCoords: GpsCoords): Observable<ForecastResponse> {
    return this.#httpClient.get<ForecastResponse>(endpoint, {
      params: {
        latitude: gpsCoords[0].toString(),
        longitude: gpsCoords[1].toString(),
        hourly:
          'temperature_2m,dew_point_2m,apparent_temperature,precipitation,wind_speed_10m,cloud_cover',
        past_days: 1,
        forecast_days: 9,
        timeformat: 'unixtime',
        wind_speed_unit: 'kn',
      },
    });
  }
}

function extractForecast(response: ForecastResponse): Forecast {
  const forecast: Forecast = {};
  const { hourly } = response;
  for (let i = hourly.time.length; i-- > 0; ) {
    const time = hourly.time[i] * 1000;
    // precipitation is the sum over the previous hour
    forecast[time - convertTime(30, 'm', 'ms')] = {
      [Condition.AMOUNT]: hourly.precipitation[i],
    };
    forecast[time] = {
      [Condition.CLOUD]: hourly.cloud_cover[i],
      [Condition.DEW]: hourly.dew_point_2m[i],
      [Condition.FEEL]: hourly.apparent_temperature[i],
      [Condition.TEMP]: hourly.temperature_2m[i],
      [Condition.WIND]: hourly.wind_speed_10m[i],
    };
  }
  return forecast;
}
