import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'schedule', loadChildren: './schedule/schedule.module#ScheduleModule' },
  { path: 'summary', loadChildren: './summary/summary.module#SummaryModule' },
  { path: 'config', loadChildren: './config/config.module#ConfigModule' },
  { path: '', loadChildren: './dashbord/dashbord.module#DashbordModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
