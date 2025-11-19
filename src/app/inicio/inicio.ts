  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { auth } from '../firebase-config';
  import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup
  } from "firebase/auth";
  import { Router } from '@angular/router';
  import { Firestore, doc, setDoc, docData } from '@angular/fire/firestore';
  import { firstValueFrom } from 'rxjs';
  import { FirestoreModule } from '@angular/fire/firestore';


  @Component({
    selector: 'app-inicio',
    imports: [FormsModule, FirestoreModule],
    templateUrl: './inicio.html',
    styleUrls: ['./inicio.scss'],
  })

  export class Inicio {

    constructor(private router: Router, private firestore: Firestore){}

    email: string = '';
    password: string = '';

    async iniciarSesion() {
      if (!this.email || !this.password) return;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;
        await this.verificarRolEnFirestore(user.uid, user.email, user);
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

          await this.verificarRolEnFirestore(user.uid, user.email, user);
        } catch (error: any) {
          alert(`Error al iniciar sesión con Google: ${error.message}`); 
        }
      }
    }

    private async verificarRolEnFirestore(uid: string, email: string | null, user: any) {
      if (!email) return;

      const userRef = doc(this.firestore, "usuarios", uid);

      let userSnap: any = null;
      try {
        userSnap = await firstValueFrom(docData(userRef, { idField: 'id' }));
      } catch {
        userSnap = null;
      }

      let rolAsignado = "";

          if (!userSnap) {
            rolAsignado = "";

          const displayName = user.displayName || "";
          const partes = displayName.split(" ");
          const nombre = partes[0] || "";
          const apellido = partes.slice(1).join(" ") || "";

          await setDoc(userRef, {
            email,
            nombre,
            apellido,
            nombreCompleto: displayName,
            foto: user.photoURL || null,
            rol: rolAsignado
          });
        }else {
            rolAsignado = userSnap.rol;
        }

      switch (rolAsignado) {
        case "admin":
          this.router.navigate(['/']);
          break;

        case "programador":
          this.router.navigate(['/programador']);
          break;

        case "usuario":
          this.router.navigate(['/portafolioProg']);
          break;
        default: 
          this.router.navigate(['/']);
          break;
      }
    }

    irRegistro() {
      this.router.navigate(['/registrar']);
    }
  }
