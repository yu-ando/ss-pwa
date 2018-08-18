import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScheduleRoutingModule } from './schedule-routing.module';
import { EditorComponent } from './editor/editor.component';

import { AngularSlickgridModule } from 'angular-slickgrid';
import { TranslateModule } from '@ngx-translate/core';

import { ScheduleService } from '../service/schedule.service';
import { ConfigService } from '../service/config.service';

@NgModule({
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    TranslateModule.forRoot(),
    AngularSlickgridModule.forRoot()
  ],
  declarations: [
    EditorComponent
  ],
  providers: [
    ScheduleService,
    ConfigService
  ]
})
export class ScheduleModule { }
