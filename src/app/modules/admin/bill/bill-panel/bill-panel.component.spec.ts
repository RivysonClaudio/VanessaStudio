import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillPanelComponent } from './bill-panel.component';

describe('BillPanelComponent', () => {
  let component: BillPanelComponent;
  let fixture: ComponentFixture<BillPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
