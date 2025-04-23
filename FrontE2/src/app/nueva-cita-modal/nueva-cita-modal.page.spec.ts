import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaCitaModalPage } from './nueva-cita-modal.page';

describe('NuevaCitaModalPage', () => {
  let component: NuevaCitaModalPage;
  let fixture: ComponentFixture<NuevaCitaModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaCitaModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
