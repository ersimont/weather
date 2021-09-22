import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AbstractSource } from 'app/sources/abstract-source';
import { Condition } from 'app/state/condition';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { SourceId } from 'app/state/source';
import { metersPerSecondToKnots } from 'app/state/units';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// API docs:
// https://docs.tomorrow.io/reference

const endpoint =
  'https://us-central1-proxic.cloudfunctions.net/api/tomorrow-io/v4/timelines';
// 'http://localhost:8080/tomorrow-io/v4/timelines';

export interface TimelinesResponse {
  data: {
    timelines: Array<{
      intervals: Array<{
        startTime: string;
        values: IntervalValues;
      }>;
    }>;
  };
}

export interface IntervalValues {
  cloudCover: number;
  dewPoint: number;
  precipitationIntensity: number;
  temperature: number;
  temperatureApparent: number;
  windSpeed: number;
}

@Injectable({ providedIn: 'root' })
export class TomorrowIo extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.TOMORROW_IO, injector);
  }

  protected fetch(gpsCoords: GpsCoords): Observable<Forecast> {
    return this.fetchRes(gpsCoords).pipe(map(extractForecast));
  }

  private fetchRes(gpsCoords: GpsCoords): Observable<TimelinesResponse> {
    return this.httpClient.get<TimelinesResponse>(endpoint, {
      params: {
        location: gpsCoords.join(),
        timesteps: '1h',
        fields:
          'cloudCover,dewPoint,precipitationIntensity,temperature,temperatureApparent,windSpeed',
      },
    });
  }
}

function extractForecast(response: TimelinesResponse): Forecast {
  const forecast: Forecast = {};
  for (const interval of response.data.timelines[0].intervals) {
    forecast[new Date(interval.startTime).getTime()] = {
      [Condition.AMOUNT]: interval.values.precipitationIntensity,
      [Condition.CLOUD]: interval.values.cloudCover,
      [Condition.DEW]: interval.values.dewPoint,
      [Condition.FEEL]: interval.values.temperatureApparent,
      [Condition.TEMP]: interval.values.temperature,
      [Condition.WIND]: metersPerSecondToKnots(interval.values.windSpeed),
    };
  }
  return forecast;
}
