import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-inicio',
  imports: [FormsModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss'],
})
export class Inicio {
  email: string = '';
  password: string = '';

  iniciarSesion() {
    if (this.email && this.password) {
      alert(`Iniciando sesión con:\nCorreo: ${this.email}`);
    } else {
      alert('Por favor, ingresa tu correo y contraseña.');
    }
  }
}
