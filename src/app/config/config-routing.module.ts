import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigComponent } from "./config.component";
import { BackupComponent } from "./backup/backup.component";
import { StorageComponent } from "./storage/storage.component";

const routes: Routes = [
  { path: 'storage', component: StorageComponent },
  { path: 'backup', component: BackupComponent },
  { path: '', component: ConfigComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule { }
