import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { FullCalendarModule } from '@fullcalendar/angular'; 
import { SharedModule } from '../../shared/shared.module';





import { HomePageRoutingModule } from './home-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FullCalendarModule,
    HomePageRoutingModule,
    SharedModule
  ],
  declarations: [HomePage],

})
export class HomePageModule {}
