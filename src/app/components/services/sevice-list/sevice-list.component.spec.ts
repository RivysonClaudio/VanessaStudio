import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeviceListComponent } from './sevice-list.component';

describe('SeviceListComponent', () => {
  let component: SeviceListComponent;
  let fixture: ComponentFixture<SeviceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeviceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeviceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
