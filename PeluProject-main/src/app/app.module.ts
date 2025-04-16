  import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { RouteReuseStrategy } from '@angular/router';
  import { FullCalendarModule } from '@fullcalendar/angular';
  import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
  import { AppComponent } from './app.component';
  import { AppRoutingModule } from './app-routing.module';
  import { HttpClientModule } from '@angular/common/http';
  import { FormsModule } from '@angular/forms';
  import { ReactiveFormsModule } from '@angular/forms';
  import { ProductGraphComponent } from './product-graph/product-graph.component';
  import { BorrowModalComponent } from './shared/modals/borrow-modal/borrow-modal.component';

  @NgModule({
    declarations: [
      ProductGraphComponent, // Se agrega el ProductGraphComponent
      AppComponent,
      BorrowModalComponent
    ],
    imports: [
      BrowserModule,
      IonicModule.forRoot(),
      AppRoutingModule,
      FullCalendarModule,
      FormsModule,
      ReactiveFormsModule,
      HttpClientModule
    ],
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], // Si usas Web Components, asegúrate de agregar esto
    bootstrap: [AppComponent],
  })
  export class AppModule {}
