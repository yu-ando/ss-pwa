import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ConfigRoutingModule } from './config-routing.module';
import { ConfigComponent } from './config.component';
import { StorageComponent } from './storage/storage.component';
import { ScheduleService } from '../service/schedule.service';
import { ConfigService } from '../service/config.service';

@NgModule({
  imports: [
    CommonModule,
    ConfigRoutingModule,
    FormsModule
  ],
  declarations: [
    ConfigComponent,
    StorageComponent
  ],
  providers: [
    ScheduleService,
    ConfigService
  ]
})
export class ConfigModule { }
