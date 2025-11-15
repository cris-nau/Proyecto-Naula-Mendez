  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { auth, db } from '../firebase-config';
  import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup
  } from "firebase/auth";
  import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
  import { Router } from '@angular/router';


  @Component({
    selector: 'app-inicio',
    imports: [FormsModule],
    templateUrl: './inicio.html',
    styleUrls: ['./inicio.scss'],
  })

  export class Inicio {
    email: string = '';
    password: string = '';

    constructor(private router: Router){}

    async iniciarSesion() {
      if (!this.email || !this.password) {
        return;
      }
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        this.router.navigate(['/portafolioProg']);
      } catch (error: any) {
        alert(`Error al iniciar sesión: ${error.message}`);
      }
    }

    async loginGoogle() {
      if (typeof window !== 'undefined') { 
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;

          await this.verificarRolEnFirestore(user.uid, user.email);
        } catch (error: any) {
          alert(`Error al iniciar sesión con Google: ${error.message}`); 
        }
      }
    }

    private async verificarRolEnFirestore(uid: string, email: string | null) {
      if (!email) return;

      const userRef = doc(db, "usuarios", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        let rolAsignado = "usuario";
        if (email.endsWith("@adm.port.com")) rolAsignado = "admin";
        if (email.endsWith("@pro.port.com")) rolAsignado = "programador";

        await setDoc(userRef, {
          email: email,
          rol: rolAsignado
        });
      }
      this.router.navigate(['/portafolioProg']);
    }

    irRegistro() {
      this.router.navigate(['/registrar']);
    }
  }
