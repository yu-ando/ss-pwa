import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SummaryRoutingModule } from './summary-routing.module';
import { ReportComponent } from './report/report.component';

import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    SummaryRoutingModule,
    TranslateModule.forRoot(),
    AngularSlickgridModule.forRoot()
  ],
  declarations: [ReportComponent]
})
export class SummaryModule { }
