import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Registro } from './registro/registro';
import { Portafolio } from './portafolio/portafolio';
import { PortafolioProg } from './portafolio-prog/portafolio-prog';

export const routes: Routes = [
  { path: '', component:  Portafolio},
  { path: 'inicio', component: Inicio },
  { path: 'registrar', component: Registro },
  { path: 'portafolio', component: Portafolio },
  { path: 'portafolioProg', component: PortafolioProg },
];
