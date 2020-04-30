import { By } from "@angular/platform-browser";
import { GraphComponent } from "app/graph/graph.component";
import { WeatherGraphContext } from "app/test-helpers/weather-graph-context";
import { take } from "rxjs/operators";

export class GraphComponentHarness {
  constructor(private ctx: WeatherGraphContext) {}

  showsData() {
    return this.getDataSets().some((dataSet) => dataSet.data?.length);
  }

  private getDataSets() {
    let dataSets: Chart.ChartDataSets[];
    this.getComponent()
      .dataSets$.pipe(take(1))
      .subscribe((ds) => {
        dataSets = ds;
      });
    return dataSets!;
  }

  private getComponent(): GraphComponent {
    return this.ctx.debugElement.query(By.directive(GraphComponent)).context;
  }
}
