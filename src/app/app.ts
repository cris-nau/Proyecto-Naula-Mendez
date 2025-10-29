import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Inicio } from './inicio/inicio';

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA-zKoE2W9lcZ0TIp0Dx0YgFxERwo7_2vM",
  authDomain: "proyecto-naula-mendez.firebaseapp.com",
  projectId: "proyecto-naula-mendez",
  storageBucket: "proyecto-naula-mendez.firebasestorage.app",
  messagingSenderId: "220939884279",
  appId: "1:220939884279:web:78899cd4693ec7da8de5f2",
  measurementId: "G-19ZNYD9RE0"
};

const app = initializeApp(firebaseConfig);
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      const analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics activado');
    } else {
      console.warn('⚠️ Firebase Analytics no soportado en este entorno');
    }
  });
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Inicio],
  template: `
    <app-inicio></app-inicio>
  `
})
export class App {
  email: string = '';
  password: string = '';

  onLogin() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    // Aquí luego integras Firebase Auth
  }
}

