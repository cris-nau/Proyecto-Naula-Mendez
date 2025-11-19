import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramadorPagina } from './programador-pagina';

describe('ProgramadorPagina', () => {
  let component: ProgramadorPagina;
  let fixture: ComponentFixture<ProgramadorPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramadorPagina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramadorPagina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
