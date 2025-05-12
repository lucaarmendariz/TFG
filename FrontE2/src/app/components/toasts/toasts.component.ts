import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-toasts',
    templateUrl: './toasts.component.html',
    styleUrls: ['./toasts.component.scss'],
    standalone: false
})
export class ToastsComponent  implements OnInit {
  @Input() mezua!:string;
  
  constructor() { }

  ngOnInit() {}

}
