import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  MatButtonToggleModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSlideToggleModule,
} from "@angular/material";
import { EventTrackingModule } from "app/to-replace/event-tracking/event-tracking.module";
import { NasModelModule } from "ng-app-state";
import { OptionsComponent } from "./options.component";
import { LocationOptionsComponent } from "./location-options/location-options.component";
import { SourceOptionsComponent } from "./source-options/source-options.component";
import { UnitOptionsComponent } from "./unit-options/unit-options.component";
import { ConditionOptionsComponent } from "./condition-options/condition-options.component";

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
    FormsModule,
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
