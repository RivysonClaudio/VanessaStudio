import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteCartaoComponent } from './cliente-cartao.component';

describe('ClienteCartaoComponent', () => {
  let component: ClienteCartaoComponent;
  let fixture: ComponentFixture<ClienteCartaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteCartaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteCartaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
