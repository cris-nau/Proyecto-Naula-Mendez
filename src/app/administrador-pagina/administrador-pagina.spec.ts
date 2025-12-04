import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministradorPagina } from './administrador-pagina';

describe('AdministradorPagina', () => {
  let component: AdministradorPagina;
  let fixture: ComponentFixture<AdministradorPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorPagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministradorPagina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
