import { Component, inject } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { WeatherStore } from 'app/state/weather-store';
import { ConditionOptionsComponent } from './condition-options/condition-options.component';
import { LocationOptionsComponent } from './location-options/location-options.component';
import { SourceOptionsComponent } from './source-options/source-options.component';
import { UnitOptionsComponent } from './unit-options/unit-options.component';

@Component({
  selector: 'app-options',
  imports: [
    MatExpansionModule,
    LocationOptionsComponent,
    SourceOptionsComponent,
    UnitOptionsComponent,
    ConditionOptionsComponent,
  ],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css',
})
export class OptionsComponent {
  store = inject(WeatherStore);
}
