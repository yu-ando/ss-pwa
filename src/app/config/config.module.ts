import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigComponent } from './config.component';
import { StorageComponent } from './storage/storage.component';
import { ScheduleService } from "../service/schedule.service";

@NgModule({
  imports: [
    CommonModule,
    ConfigRoutingModule
  ],
  declarations: [
    ConfigComponent,
    StorageComponent
  ],
  providers: [
    ScheduleService
  ]
})
export class ConfigModule { }
