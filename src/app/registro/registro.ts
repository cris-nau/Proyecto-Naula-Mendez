import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [FormsModule, FirestoreModule, CommonModule],
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
  mensajeExito: string | null = null;

  constructor(private router: Router, private firestore: Firestore) {}

  async registrarCuenta() {
    this.errorMsg = null;
    this.mensajeExito = null;

    if (!this.email.trim() || !this.password.trim() || !this.nombre.trim() || !this.apellido.trim()) {
      this.errorMsg = "Por favor completa todos los campos.";
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

      this.mensajeExito = "Usuario registrado exitosamente 🎉";
      this.email = '';
      this.password = '';
      this.nombre = '';
      this.apellido = '';
      
      setTimeout(() => {
        this.mensajeExito = null;
        this.irLogin();
      }, 3000);
      
    } catch (err: any) {
      console.error('Error registrando:', err);
      this.errorMsg = err?.message || 'Ocurrió un error al registrar la cuenta.';
    } finally {
      this.cargando = false;
    }
  }

  irLogin() {
    this.router.navigate(['/inicio']);
  }
}
