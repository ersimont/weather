import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WeatherStore } from 'app/state/weather-store';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsComponent {
  constructor(public store: WeatherStore) {}
}
