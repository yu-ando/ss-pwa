import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SummaryRoutingModule } from './summary-routing.module';
import { ReportComponent } from './report/report.component';

import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule } from '@ngx-translate/core';

import { ScheduleService } from '../service/schedule.service';
import { ConfigService } from "../service/config.service";
import { AnalyzerComponent } from './analyzer/analyzer.component';

@NgModule({
  imports: [
    CommonModule,
    SummaryRoutingModule,
    TranslateModule.forRoot(),
    AngularSlickgridModule.forRoot()
  ],
  declarations: [
    ReportComponent,
    AnalyzerComponent
  ],
  providers: [
    ScheduleService,
    ConfigService
  ]
})
export class SummaryModule { }
