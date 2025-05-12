import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
})
export class GaleriaComponent {
  @Input() imagenes: string[] = [];

  constructor(private modalController: ModalController) {}

  transformarURL(url: string): string {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : url;
  }

  swiperSlideChanged(e:any)
  {
    console.log("changed" , e)
  }

  cerrar() {
    this.modalController.dismiss();
  }
}