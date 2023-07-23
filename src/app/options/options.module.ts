import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NasModelModule } from '@s-libs/ng-app-state';
import { EventTrackingModule } from 'app/to-replace/event-tracking/event-tracking.module';
import { ConditionOptionsComponent } from './condition-options/condition-options.component';
import { LocationOptionsComponent } from './location-options/location-options.component';
import { OptionsComponent } from './options.component';
import { SourceOptionsComponent } from './source-options/source-options.component';
import { UnitOptionsComponent } from './unit-options/unit-options.component';

@NgModule({
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
        OptionsComponent,
        LocationOptionsComponent,
        SourceOptionsComponent,
        UnitOptionsComponent,
        ConditionOptionsComponent,
    ],
    exports: [OptionsComponent],
})
export class OptionsModule {}
