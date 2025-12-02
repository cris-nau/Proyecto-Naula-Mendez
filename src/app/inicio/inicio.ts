  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { auth } from '../firebase-config';
  import { 
    getRedirectResult,
    signInWithRedirect,
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup
  } from "firebase/auth";
  import { Router } from '@angular/router';
  import { Firestore, doc, setDoc, docData, getDoc } from '@angular/fire/firestore';
  import { firstValueFrom } from 'rxjs';
  import { FirestoreModule } from '@angular/fire/firestore';
  import { inject, Injector } from '@angular/core';
  import { runInInjectionContext } from '@angular/core';


  @Component({
    selector: 'app-inicio',
    imports: [FormsModule, FirestoreModule],
    templateUrl: './inicio.html',
    styleUrls: ['./inicio.scss'],
  })

  export class Inicio {

    private injector = inject(Injector);
    private firestore = inject(Firestore);

    constructor(private router: Router){}

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

          await this.verificarRolEnFirestore(user!.uid, user.email, user);
        } catch (error: any) {
          alert(`Error al iniciar sesión con Google: ${error.message}`); 
        }
      }
    }

    private async verificarRolEnFirestore(uid: string, email: string | null, user: any) {
      if (!email) return;

      const { userRef, userProg } = await runInInjectionContext(this.injector, async () => {
        const uRef = doc(this.firestore, "usuarios", uid);
        const pRef = doc(this.firestore, "programadores", uid);
        return { userRef: uRef, userProg: pRef };
      });

      let userSnap: any = null;
      try {
        userSnap = await runInInjectionContext(this.injector, async () => 
          await firstValueFrom(docData(userRef, { idField: 'id' }))
        );
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

        
        await runInInjectionContext(this.injector, async () => 
          await setDoc(userRef, {
            email,
            nombre,
            apellido,
            nombreCompleto: displayName,
            foto: user.photoURL || null,
            rol: rolAsignado
          })
        );

        try {
          userSnap = await runInInjectionContext(this.injector, async () =>
            await firstValueFrom(docData(userRef, { idField: 'id' }))
          );
        } catch {
          userSnap = null;
        }
      } else {
        rolAsignado = userSnap.rol;
      }

      rolAsignado = userSnap?.rol || "";

      switch (rolAsignado) {
        case "admin":
          this.router.navigate(['/']);
          break;

        case "programador":
          
          const portafolioSnap = await runInInjectionContext(this.injector, async () => await getDoc(userProg));
          if (!portafolioSnap.exists()) {
            await runInInjectionContext(this.injector, async () =>
              await setDoc(userProg, {
                nombre: user.displayName || "",
                foto: user.photoURL || null,
                contacto: "",
                descripcion:"",
                especialidad: "",
                redes_sociales: [],
              })
            );
          }
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
