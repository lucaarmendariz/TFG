import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { InfoCitaComponent } from 'src/app/shared/Agenda/info-cita/info-cita.component';

@Component({
  selector: 'app-box-list',
  templateUrl: './box-list.component.html',
  styleUrls: ['./box-list.component.scss'],
})
export class BoxListComponent implements OnInit {
 @Input() nombre: string = ''; 

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

}
