import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportComponent } from './report/report.component';
import { AnalyzerComponent } from './analyzer/analyzer.component';

const routes: Routes = [
  { path: 'report/:year/:month', component: ReportComponent },
  { path: 'report', component: ReportComponent },
  { path: 'analyzer/:year/:month', component: AnalyzerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SummaryRoutingModule { }
