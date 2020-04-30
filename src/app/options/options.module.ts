import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { EventTrackingModule } from "app/to-replace/event-tracking/event-tracking.module";
import { NasModelModule } from "ng-app-state";
import { ConditionOptionsComponent } from "./condition-options/condition-options.component";
import { LocationOptionsComponent } from "./location-options/location-options.component";
import { OptionsComponent } from "./options.component";
import { SourceOptionsComponent } from "./source-options/source-options.component";
import { UnitOptionsComponent } from "./unit-options/unit-options.component";

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
