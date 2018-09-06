import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { EditorComponent } from './editor/editor.component';

import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule } from '@ngx-translate/core';

import { ScheduleService } from '../service/schedule.service';
import { ConfigService } from '../service/config.service';

import { SimpleModalModule } from 'ngx-simple-modal';
import { HistoryModalComponent } from './history-modal/history-modal.component';

import { MatNativeDateModule, MatInputModule } from '@angular/material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MomentDateModule } from "@angular/material-moment-adapter";

@NgModule({
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    TranslateModule.forRoot(),
    AngularSlickgridModule.forRoot(),
    SimpleModalModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MomentDateModule
  ],
  declarations: [
    EditorComponent,
    HistoryModalComponent
  ],
  providers: [
    ScheduleService,
    ConfigService
  ],
  entryComponents: [
    HistoryModalComponent
  ]
})
export class ScheduleModule { }
