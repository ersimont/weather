import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { NasModelModule } from '@s-libs/ng-app-state';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { ConditionOptionsComponent } from './condition-options/condition-options.component';
import { LocationOptionsComponent } from './location-options/location-options.component';
import { OptionsComponent } from './options.component';
import { SourceOptionsComponent } from './source-options/source-options.component';
import { UnitOptionsComponent } from './unit-options/unit-options.component';

@NgModule({
  declarations: [
    OptionsComponent,
    LocationOptionsComponent,
    SourceOptionsComponent,
    UnitOptionsComponent,
    ConditionOptionsComponent,
  ],
  imports: [
    CommonModule,
    EventTrackingModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    NasModelModule,
  ],
  exports: [OptionsComponent],
})
export class OptionsModule {}
