import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { BackupComponent } from './backup/backup.component';
import { ConfigComponent } from './config.component';

@NgModule({
  imports: [
    CommonModule,
    ConfigRoutingModule
  ],
  declarations: [BackupComponent, ConfigComponent]
})
export class ConfigModule { }
