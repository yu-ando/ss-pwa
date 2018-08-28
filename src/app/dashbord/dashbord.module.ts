import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashbordComponent } from './dashbord.component';
import { SharedModule } from '../shared';
import { DashbordRoutingModule } from './dashbord-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DashbordRoutingModule
  ],
  declarations: [DashbordComponent]
})
export class DashbordModule { }
