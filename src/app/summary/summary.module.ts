import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SummaryRoutingModule } from './summary-routing.module';
import { ReportComponent } from './report/report.component';

import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule } from '@ngx-translate/core';

import { ScheduleService } from '../service/schedule.service';

@NgModule({
  imports: [
    CommonModule,
    SummaryRoutingModule,
    TranslateModule.forRoot(),
    AngularSlickgridModule.forRoot()
  ],
  declarations: [
    ReportComponent
  ],
  providers: [
    ScheduleService
  ]
})
export class SummaryModule { }
