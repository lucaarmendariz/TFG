import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-botoiak-konponentea',
  templateUrl: './home-botoiak-konponentea.component.html',
  styleUrls: ['./home-botoiak-konponentea.component.scss'],
})
export class HomeBotoiakKonponenteaComponent  implements OnInit {
  @Input() botoiTitulua!:string;
  @Input() iconIzena!:string;
  @Input() kolorea!:string;

  constructor() { }

  ngOnInit() {}

}
