import { Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

export interface HistoryModel {
  message: string;
}

@Component({
  selector: 'app-history-modal',
  templateUrl: './history-modal.component.html',
  styleUrls: ['./history-modal.component.scss']
})
export class HistoryModalComponent extends SimpleModalComponent<HistoryModel, boolean> implements HistoryModel, OnInit {
  analyzeConditions: any[];
  message: string;
  constructor() {
    super();
    console.log('modal constructor!!');
  }
  ngOnInit() {
    console.log('ngOnInit!!');
    console.log(this.analyzeConditions);
  }
  confirm() {
    // on click on confirm button we set dialog result as true,
    // ten we can get dialog result from caller code
    this.result = true;
    this.close();
  }
  cancel() {
    this.result = false;
    this.close();
  }
}
