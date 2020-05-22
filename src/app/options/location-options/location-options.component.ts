import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatRadioChange } from '@angular/material/radio';
import { LocationService } from 'app/misc-services/location.service';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';

@Component({
  selector: 'app-location-options',
  templateUrl: './location-options.component.html',
  styleUrls: ['./location-options.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationOptionsComponent extends AbstractOptionDirective {
  useCurrentLocation: boolean;
  customSearch: string;

  protected optionType = 'location';

  @ViewChild(MatExpansionPanel)
  private panel!: MatExpansionPanel;

  constructor(injector: Injector, public locationService: LocationService) {
    super(injector);
    this.useCurrentLocation = this.store.state().useCurrentLocation;
    this.customSearch = this.store.state().customLocation.search;

    this.subscribeTo(this.locationService.askForLocation$, () => {
      this.panel.open();
    });
  }

  setUseCurrentLocation(event: MatRadioChange | Event) {
    if (event instanceof MatRadioChange) {
      this.locationService.setUseCurrentLocation(event.value);
      this.trackChange('current_selection');
    }
  }
}
