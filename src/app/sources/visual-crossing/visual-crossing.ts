import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AbstractSource } from 'app/sources/abstract-source';
import { Condition } from 'app/state/condition';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { SourceId } from 'app/state/source';
import { kilometersPrHourToKnots } from 'app/state/units';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// API docs:
// https://www.visualcrossing.com/weather/weather-data-services#/timeline

const endpoint =
  'https://us-central1-proxic.cloudfunctions.net/api/visual-crossing/VisualCrossingWebServices/rest/services/timeline';
// 'http://localhost:8080/visual-crossing/VisualCrossingWebServices/rest/services/timeline';

export interface TimelineResponse {
  days: Array<{ hours: Hour[] }>;
}

export interface Hour {
  datetimeEpoch: number;
  temp: number;
  feelslike: number;
  dew: number;
  precip: number;
  windspeed: number;
  cloudcover: number;
}

@Injectable({ providedIn: 'root' })
export class VisualCrossing extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.VISUAL_CROSSING, injector);
  }

  fetch(gpsCoords: GpsCoords): Observable<Forecast> {
    return this.fetchTimeline(gpsCoords).pipe(
      map((res) => {
        const forecast: Forecast = {};
        for (const day of res.days) {
          for (const hour of day.hours) {
            addConditions(forecast, hour);
          }
        }
        return forecast;
      }),
    );
  }

  private fetchTimeline(gpsCoords: GpsCoords): Observable<TimelineResponse> {
    return this.httpClient.get<TimelineResponse>(
      `${endpoint}/${gpsCoords.join(',')}`,
      { params: { unitGroup: 'metric', include: 'hours' } },
    );
  }
}

function addConditions(forecast: Forecast, hour: Hour): void {
  forecast[hour.datetimeEpoch * 1000] = {
    [Condition.AMOUNT]: hour.precip,
    [Condition.CLOUD]: hour.cloudcover,
    [Condition.DEW]: hour.dew,
    [Condition.FEEL]: hour.feelslike,
    [Condition.TEMP]: hour.temp,
    [Condition.WIND]: kilometersPrHourToKnots(hour.windspeed),
  };
}