import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesPanelComponent } from './clientes-panel.component';

describe('ClientesPanelComponent', () => {
  let component: ClientesPanelComponent;
  let fixture: ComponentFixture<ClientesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientesPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
