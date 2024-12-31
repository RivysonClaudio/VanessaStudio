import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeviceFormComponent } from './sevice-form.component';

describe('SeviceFormComponent', () => {
  let component: SeviceFormComponent;
  let fixture: ComponentFixture<SeviceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeviceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeviceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
