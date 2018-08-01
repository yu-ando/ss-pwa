import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { BackupComponent } from './backup/backup.component';
import { ConfigComponent } from './config.component';
import { StorageComponent } from './storage/storage.component';

@NgModule({
  imports: [
    CommonModule,
    ConfigRoutingModule
  ],
  declarations: [BackupComponent, ConfigComponent, StorageComponent]
})
export class ConfigModule { }
