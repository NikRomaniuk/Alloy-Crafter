import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgePage } from './forge.page';

describe('ForgePage', () => {
  let component: ForgePage;
  let fixture: ComponentFixture<ForgePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
