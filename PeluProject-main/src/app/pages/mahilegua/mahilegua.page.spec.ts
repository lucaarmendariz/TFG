import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MahileguaPage } from './mahilegua.page';

describe('MahileguaPage', () => {
  let component: MahileguaPage;
  let fixture: ComponentFixture<MahileguaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MahileguaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
