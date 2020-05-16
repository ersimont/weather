import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import {
  defaultChartOptions,
  getXAxisRange,
} from 'app/misc-components/graph/chartjs-config';
import { Condition, conditionInfo } from 'app/state/condition';
import { SourceId } from 'app/state/source';
import { AmountUnit } from 'app/state/units';
import { WeatherState } from 'app/state/weather-state';
import { WeatherStore } from 'app/state/weather-store';
import { EventTrackingService } from 'app/to-replace/event-tracking/event-tracking.service';
import {
  ChartData,
  ChartDataSets,
  ChartPoint,
  ChartTooltipItem,
  PointStyle,
} from 'chart.js';
import 'chartjs-plugin-annotation';
import 'chartjs-plugin-zoom';
import { cloneDeep, debounce, forEach, keys, set } from 'micro-dash';
import { ThemeService } from 'ng2-charts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DirectiveSuperclass } from 's-ng-utils';
import { SetRangeAction } from './set-range-action';

const pointStyles: { [id in SourceId]: PointStyle } = {
  [SourceId.CLIMACELL]: 'rect',
  [SourceId.WEATHER_GOV]: 'circle',
  [SourceId.WEATHER_UNLOCKED]: 'triangle',
};

const radii: { [id in SourceId]: number } = {
  [SourceId.CLIMACELL]: 5,
  [SourceId.WEATHER_GOV]: 4,
  [SourceId.WEATHER_UNLOCKED]: 6,
};

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
  providers: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphComponent extends DirectiveSuperclass {
  chartOptions = this.getChartOptions();
  dataSets$: Observable<Array<ChartDataSets>>;

  constructor(
    private demicalPipe: DecimalPipe,
    private eventTrackingService: EventTrackingService,
    private store: WeatherStore,
    private themeService: ThemeService,
    injector: Injector,
  ) {
    super(injector);

    this.dataSets$ = this.buildDataSets$();

    this.subscribeTo(store.action$.pipe(SetRangeAction.filter), this.setRange);
  }

  private buildDataSets$() {
    return this.store.$.pipe(
      map((state) => {
        const dataSets: ChartDataSets[] = [];
        forEach(state.sources, (_, sourceId) => {
          addDataSets(sourceId, dataSets, state);
        });
        return dataSets;
      }),
    );
  }

  private setRange({ days }: SetRangeAction) {
    this.themeService.setColorschemesOptions({
      scales: { xAxes: [{ time: getXAxisRange(days) }] },
    });
  }

  private getChartOptions() {
    const options = cloneDeep(defaultChartOptions);
    set(options, ['tooltips', 'callbacks'], {
      label: this.getTooltipLabel.bind(this),
      footer: this.getTooltipFooter.bind(this),
    });
    set(
      options,
      ['plugins', 'zoom', 'pan', 'onPan'],
      debounce(() => {
        this.eventTrackingService.track('change_pan', 'zoom_and_pan');
      }, 5000),
    );
    set(
      options,
      ['plugins', 'zoom', 'zoom', 'onZoom'],
      debounce(() => {
        this.eventTrackingService.track('change_zoom', 'zoom_and_pan');
      }, 5000),
    );
    return options;
  }

  private getTooltipLabel(item: ChartTooltipItem, data: ChartData) {
    const conditionInf = conditionInfo[decodeLabelValues(item, data).condition];
    const unitInf = conditionInf.getUnitInfo(this.store.state().units);
    const display = unitInf.getDisplay(+item.value!, this.demicalPipe);
    return `${conditionInf.label}: ${display}`;
  }

  private getTooltipFooter(items: ChartTooltipItem[], data: ChartData) {
    const sourceId = decodeLabelValues(items[0], data).sourceId;
    return `Source: ${this.store.state().sources[sourceId].label}`;
  }
}

function addDataSets(
  sourceId: SourceId,
  dataSets: ChartDataSets[],
  state: WeatherState,
) {
  // the first ones added will be displayed on top of later ones
  addDataSet(sourceId, dataSets, state, Condition.TEMP, 'dynamic');
  addDataSet(sourceId, dataSets, state, Condition.FEEL, 'dynamic');
  addDataSet(sourceId, dataSets, state, Condition.DEW, 'dynamic');
  addDataSet(sourceId, dataSets, state, Condition.WIND, 'dynamic');
  addDataSet(
    sourceId,
    dataSets,
    state,
    Condition.AMOUNT,
    state.units.amount === AmountUnit.IN ? 'inches' : 'millimeters',
    '60',
  );
  addDataSet(sourceId, dataSets, state, Condition.CLOUD, 'percentage', '20');
}

function addDataSet(
  sourceId: SourceId,
  dataSets: ChartDataSets[],
  state: WeatherState,
  condition: Condition,
  yAxisID: string,
  fillAlpha = '00',
) {
  const conditionInf = conditionInfo[condition];
  const color = conditionInf.color;
  const pointStyle = pointStyles[sourceId];
  dataSets.push({
    label: encodeLabelValues(sourceId, condition),
    data: getData(sourceId, condition, state),
    yAxisID,
    borderColor: color,
    backgroundColor: color + fillAlpha,
    pointBackgroundColor: color,
    pointStyle,
    radius: radii[sourceId],
    pointHitRadius: 25,
  });
}

function getData(
  sourceId: SourceId,
  condition: Condition,
  state: WeatherState,
) {
  const data: ChartPoint[] = [];
  const source = state.sources[sourceId];
  const unitInf = conditionInfo[condition].getUnitInfo(state.units);
  if (source.show && state.showConditions[condition]) {
    for (const time of keys(source.forecast).sort()) {
      const value = source.forecast[time as any][condition];
      if (value !== undefined) {
        data.push({ t: +time, y: unitInf.convert(value) });
      }
    }
  }
  return data;
}

interface LabelIds {
  sourceId: SourceId;
  condition: Condition;
}

function encodeLabelValues(sourceId: SourceId, condition: Condition) {
  return JSON.stringify({ sourceId, condition });
}

function decodeLabelValues(
  item: Chart.ChartTooltipItem,
  data: Chart.ChartData,
): LabelIds {
  return JSON.parse(data.datasets![item.datasetIndex!].label!);
}
