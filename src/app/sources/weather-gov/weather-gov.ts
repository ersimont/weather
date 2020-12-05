import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { AbstractSource, notAvailableHere } from 'app/sources/abstract-source';
import { Condition, Conditions } from 'app/state/condition';
import { Forecast } from 'app/state/forecast';
import { GpsCoords } from 'app/state/location';
import { SourceId } from 'app/state/source';
import { get, round } from '@s-libs/micro-dash';
import { duration } from 'moment';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

// API docs:
// https://www.weather.gov/documentation/services-web-api

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

@Injectable({ providedIn: 'root' })
export class WeatherGov extends AbstractSource {
  constructor(private httpClient: HttpClient, injector: Injector) {
    super(SourceId.WEATHER_GOV, injector);
  }

  fetch(gpsCoords: [number, number]): Observable<Forecast> {
    return this.fetchPoint(gpsCoords).pipe(
      switchMap((pointResponse) => this.fetchZone(pointResponse)),
      map(extractForecast),
      catchError((err) => {
        if (
          get(err, ['error', 'type']) ===
          'https://api.weather.gov/problems/InvalidPoint'
        ) {
          return throwError(notAvailableHere);
        } else {
          return throwError(err);
        }
      }),
    );
  }

  private fetchPoint(gpsCoords: GpsCoords): Observable<PointResponse> {
    const endpoint = `https://api.weather.gov/points`;
    return this.httpClient.get<PointResponse>(
      // weather.gov seems to redirect to a URL w/ GPS rounded to 4 decimal places. So we'll save the extra request.
      `${endpoint}/${gpsCoords.map((coord) => round(coord, 4)).join(',')}`,
    );
  }

  private fetchZone(point: PointResponse): Observable<GridResponse> {
    return this.httpClient.get<GridResponse>(point.properties.forecastGridData);
  }
}

function extractForecast(gridResponse: GridResponse): Forecast {
  const forecast: Forecast = {};
  addFromZone(
    forecast,
    gridResponse,
    Condition.AMOUNT,
    'quantitativePrecipitation',
  );
  addFromZone(forecast, gridResponse, Condition.CLOUD, 'skyCover');
  addFromZone(forecast, gridResponse, Condition.DEW, 'dewpoint');
  addFromZone(forecast, gridResponse, Condition.FEEL, 'apparentTemperature');
  addFromZone(forecast, gridResponse, Condition.TEMP, 'temperature');
  addFromZone(forecast, gridResponse, Condition.WIND, 'windSpeed');
  return forecast;
}

function addFromZone(
  forecast: Forecast,
  zone: GridResponse,
  condition: Condition,
  zoneKey: keyof GridResponse['properties'],
): void {
  for (const v of zone.properties[zoneKey].values) {
    const [startString, durationString] = v.validTime.split('/');
    const length = duration(durationString);
    const time = new Date(startString).getTime() + length.asMilliseconds() / 2;

    let value = v.value;
    if (condition === Condition.AMOUNT) {
      value /= length.asHours();
    }
    addCondition(forecast, time, condition, value);
  }
}

function addCondition(
  forecast: Forecast,
  time: number,
  condition: Condition,
  value: number,
): void {
  let conditions: Conditions = forecast[time];
  if (!conditions) {
    conditions = forecast[time] = {};
  }
  conditions[condition] = value;
}
