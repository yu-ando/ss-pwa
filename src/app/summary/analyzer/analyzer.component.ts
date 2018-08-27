import { Component, OnInit } from '@angular/core';
import {ScheduleService} from "../../service/schedule.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigService} from "../../service/config.service";

@Component({
  selector: 'app-analyzer',
  templateUrl: './analyzer.component.html',
  styleUrls: ['./analyzer.component.scss']
})
export class AnalyzerComponent implements OnInit {
  private scs: ScheduleService;
  private cos: ConfigService;

  dateList = {};

  constructor(private router: Router, ar: ActivatedRoute, private sc: ScheduleService, private cs: ConfigService) {
    this.scs = sc;
    this.cos = cs;

    let year = 0;
    let month = 0;
    ar.params.subscribe(params => {
      if (!!params['year']) {
        year = Number(params['year']);
      } else {
        year = new Date().getFullYear();
      }
      if (!!params['month']) {
        month = Number(params['month']);
      } else {
        month = new Date().getMonth() + 1;
      }
    });
    this.setDateList(year, month);
  }
  setDateList($year, $month) {
    const current = new Date($year, $month - 1, 1);
    this.dateList['current_year'] = current.getFullYear();
    this.dateList['current_month'] = current.getMonth() + 1;
    this.dateList['current_date'] = this.dateList['current_year'] + '/' + this.dateList['current_month'];
    const pastday = new Date($year, $month - 2, 1);
    this.dateList['past_year'] = pastday.getFullYear();
    this.dateList['past_month'] = pastday.getMonth() + 1;
    this.dateList['past_date'] = this.dateList['past_year'] + '/' + this.dateList['past_month'];
    const nextday = new Date($year, $month, 1);
    this.dateList['next_year'] = nextday.getFullYear();
    this.dateList['next_month'] = nextday.getMonth() + 1;
    this.dateList['next_date'] = this.dateList['next_year'] + '/' + this.dateList['next_month'];
  }

  ngOnInit() {
  }

  // change analyze date.
  changeCurrentDate($year, $month) {
    this.setDateList($year, $month);
//    this.loadReportData();
  }
}
