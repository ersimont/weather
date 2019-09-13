import { GpsCoordsService } from "../gps-coords.service";
import { map, pluck, startWith, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { cache, logValues } from "s-rxjs-utils";
import { Observable } from "rxjs";
import { get, keyBy, mapValues } from "micro-dash";

@Injectable({ providedIn: "root" })
export class WeatherGov {
  city$: Observable<string>;
  dates$: Observable<Array<Date>>;
  apparentTemp$: Observable<Record<number, number>>;

  private zone$: Observable<any>;

  constructor(httpClient: HttpClient, gpsCoordsService: GpsCoordsService) {
    const point$ = gpsCoordsService.$.pipe(
      switchMap((coords) =>
        httpClient.get<any>(
          `https://api.weather.gov/points/${coords.join(",")}`,
        ),
      ),
      pluck("properties"),
      cache(),
    );
    this.zone$ = point$.pipe(
      switchMap((point) => httpClient.get<any>(point.forecastGridData)),
      pluck("properties"),
      logValues("grid"),
      cache(),
    );

    this.city$ = point$.pipe(
      map((point) => get(point, ["relativeLocation", "properties"])),
      map(
        (relativeLocation) =>
          `${relativeLocation.city}, ${relativeLocation.state}`,
      ),
    );
    this.dates$ = this.zone$.pipe(
      map((zone) =>
        zone.apparentTemperature.values.map((v) => new Date(v.validTime)),
      ),
      startWith({}),
    );
    this.apparentTemp$ = this.getZoneValues$("apparentTemperature");
  }

  private getZoneValues$(key: string) {
    return this.zone$.pipe(
      map((zone) =>
        mapValues(
          keyBy(zone[key].values, (v) =>
            new Date(v.validTime.split("/")[0]).getTime(),
          ),
          (v) => v.value,
        ),
      ),
      startWith({}),
    );
  }
}
