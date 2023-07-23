import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WeatherStore } from 'app/state/weather-store';
import { ConditionOptionsComponent } from './condition-options/condition-options.component';
import { UnitOptionsComponent } from './unit-options/unit-options.component';
import { SourceOptionsComponent } from './source-options/source-options.component';
import { LocationOptionsComponent } from './location-options/location-options.component';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatExpansionModule,
        LocationOptionsComponent,
        SourceOptionsComponent,
        UnitOptionsComponent,
        ConditionOptionsComponent,
    ],
})
export class OptionsComponent {
  constructor(public store: WeatherStore) {}
}
