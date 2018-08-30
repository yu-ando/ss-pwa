import { Component } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';

export interface CondModel {
    title: string;
    message: string;
}

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './cond-modal.component.html'
})
export class CondModalComponent extends SimpleModalComponent<CondModel, boolean> implements CondModel {
    title: string;
    message: string;
    constructor() {
        super();
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
