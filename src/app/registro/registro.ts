import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { auth, db } from '../firebase-config';
import { Router } from '@angular/router';
  import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup 
  } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

@Component({
  selector: 'app-registro',
  imports: [FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  email: string = '';
  password: string = '';
  rol: string = '';

  constructor(private router: Router){}

  async registrarCuenta() {
        if (!this.email || !this.password) {
          alert('Por favor, ingresa tu correo y contraseña.');
          return;
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          
          await setDoc(doc(db, "usuarios", userCredential.user.uid), {
            email: userCredential.user.email,
            rol: this.rol
          });
          this.irLogin();
        } catch (error: any) {
          
        }
  }

  irLogin() {
    this.router.navigate(['/inicio']);
  }
}
