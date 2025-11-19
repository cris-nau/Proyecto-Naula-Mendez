import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { auth } from '../firebase-config';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
  import { 
    createUserWithEmailAndPassword, 
  } from "firebase/auth";
  import { FirestoreModule } from '@angular/fire/firestore';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, FirestoreModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})

export class Registro {
  email = '';
  password = '';
  rol = '';
  nombre = '';
  apellido = '';
  cargando = false;
  errorMsg: string | null = null;

  constructor(private router: Router, private firestore: Firestore) {}

  async registrarCuenta() {
    this.errorMsg = null;

    if (!this.email || !this.password) {
      this.errorMsg = 'Correo y contraseña son obligatorios.';
      return;
    }

    this.cargando = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);

      const uid = userCredential.user.uid;
      const email = userCredential.user.email || this.email;

      const nombreCompleto = `${this.nombre || ''} ${this.apellido || ''}`.trim();
      const DEFAULT_PHOTO_URL = 'https://i.pinimg.com/236x/9b/47/a0/9b47a023caf29f113237d61170f34ad9.jpg';

      await setDoc(doc(this.firestore, 'usuarios', uid), {
        apellido: this.apellido,
        email,
        nombre: this.nombre,
        nombreCompleto: nombreCompleto,
        foto: DEFAULT_PHOTO_URL,
        rol: this.rol
      });

      // Navegar al login o a la interfaz según rol
      this.irLogin();
    } catch (err: any) {
      console.error('Error registrando:', err);
      // Puedes mapear mensajes de error de Firebase aquí
      this.errorMsg = err?.message || 'Ocurrió un error al registrar la cuenta.';
    } finally {
      this.cargando = false;
    }
  }

  irLogin() {
    this.router.navigate(['/inicio']);
  }
}
