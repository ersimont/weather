import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import {
  MatExpansionModule,
  MatExpansionPanel,
} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { LocationService } from 'app/misc-services/location.service';
import { AbstractOptionDirective } from 'app/options/abstract-option-directive/abstract-option.directive';

@Component({
  selector: 'app-location-options',
  imports: [
    MatExpansionModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './location-options.component.html',
  styleUrl: './location-options.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationOptionsComponent extends AbstractOptionDirective {
  useCurrentLocation: boolean;
  customSearch: string;

  protected optionType = 'location';

  @ViewChild(MatExpansionPanel)
  private panel!: MatExpansionPanel;

  constructor(
    injector: Injector,
    public locationService: LocationService,
  ) {
    super(injector);
    this.useCurrentLocation = this.store('useCurrentLocation').state;
    this.customSearch = this.store('customLocation')('search').state;

    this.subscribeTo(this.locationService.askForLocation$, () => {
      this.panel.open();
    });
  }

  setUseCurrentLocation(event: MatRadioChange | Event): void {
    if (event instanceof MatRadioChange) {
      this.locationService.setUseCurrentLocation(event.value);
      this.trackChange('current_selection');
    }
  }
}
