import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteCreationModalPage } from './cliente-creation-modal.page';

describe('ClienteCreationModalPage', () => {
  let component: ClienteCreationModalPage;
  let fixture: ComponentFixture<ClienteCreationModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteCreationModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
