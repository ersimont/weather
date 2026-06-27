import { Component, inject, viewChild } from '@angular/core';
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
})
export class LocationOptionsComponent extends AbstractOptionDirective {
  protected useCurrentLocation: boolean;
  protected customSearch: string;

  protected readonly optionType = 'location';
  protected readonly locationService = inject(LocationService);

  private readonly panel = viewChild.required(MatExpansionPanel);

  constructor() {
    super();
    this.useCurrentLocation = this.store('useCurrentLocation').state;
    this.customSearch = this.store('customLocation')('search').state;

    this.subscribeTo(this.locationService.askForLocation$, () => {
      this.panel().open();
    });
  }

  protected setUseCurrentLocation(event: MatRadioChange | Event): void {
    if (event instanceof MatRadioChange) {
      this.locationService.setUseCurrentLocation(event.value);
      this.trackChange('current_selection');
    }
  }
}
