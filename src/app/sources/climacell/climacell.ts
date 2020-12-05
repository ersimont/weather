import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AbstractSource } from 'app/sources/abstract-source';
import { Condition } from 'app/state/condition';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { SourceId } from 'app/state/source';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// API docs:
// https://developer.climacell.co/v3/reference

const endpoint =
  'https://us-central1-proxic.cloudfunctions.net/api/climacell/v3/weather/forecast/hourly';

export type HourlyResponse = Timeframe[];

export interface Timeframe {
  observation_time: { value: string };
  precipitation: { value: number };
  cloud_cover: { value: number };
  dewpoint: { value: number };
  feels_like: { value: number };
  temp: { value: number };
  wind_speed: { value: number };
}

@Injectable({ providedIn: 'root' })
export class Climacell extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.CLIMACELL, injector);
  }

  protected fetch(gpsCoords: GpsCoords): Observable<Forecast> {
    return this.fetchRes(gpsCoords).pipe(map(extractForecast));
  }

  private fetchRes(gpsCoords: GpsCoords): Observable<HourlyResponse> {
    return this.httpClient.get<HourlyResponse>(endpoint, {
      params: {
        lat: gpsCoords[0].toString(),
        lon: gpsCoords[1].toString(),
        fields:
          'cloud_cover,dewpoint,feels_like,precipitation,temp,wind_speed:knots',
      },
    });
  }
}

function extractForecast(response: Timeframe[]): Forecast {
  const forecast: Forecast = {};
  for (const timeframe of response) {
    const time = new Date(timeframe.observation_time.value).getTime();
    forecast[time] = {
      [Condition.AMOUNT]: timeframe.precipitation.value,
      [Condition.CLOUD]: timeframe.cloud_cover.value,
      [Condition.DEW]: timeframe.dewpoint.value,
      [Condition.FEEL]: timeframe.feels_like.value,
      [Condition.TEMP]: timeframe.temp.value,
      [Condition.WIND]: timeframe.wind_speed.value,
    };
  }
  return forecast;
}
