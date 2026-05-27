/**
 * auth.js
 * Controla el formulario de inicio de sesión del panel administrativo.
 *
 * Valida las credenciales ingresadas contra los valores fijos del administrador.
 * Si son correctas, guarda la sesión en sessionStorage y redirige al dashboard.
 * Si son incorrectas, muestra un mensaje de error en el formulario.
 */

import { saveSession } from './storage.js';

// Credenciales del administrador (hardcodeadas para este proyecto de demostración).
const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '123456';

const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

/**
 * Valida que una cadena tenga formato de correo electrónico válido.
 * Usa una expresión regular básica: algo@algo.algo
 * @param {string} value - Cadena a validar.
 * @returns {boolean}
 */
function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Muestra un mensaje de feedback debajo del formulario.
 * @param {string} text - Texto del mensaje.
 * @param {'error'|'success'} type - Tipo de mensaje (cambia el color).
 */
function showMessage(text, type = 'error') {
  messageElement.textContent = text;
  messageElement.className = `auth-message ${type}`;
}

/**
 * Maneja el envío del formulario de login.
 * Pasos:
 *  1. Previene el comportamiento por defecto del formulario.
 *  2. Extrae y limpia los valores de email y contraseña.
 *  3. Valida que los campos no estén vacíos.
 *  4. Valida el formato del email.
 *  5. Compara con las credenciales del administrador.
 *  6. Si todo es correcto, guarda la sesión y redirige al dashboard.
 */
function handleLogin(event) {
  event.preventDefault();

  const fd = new FormData(loginForm);
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const password = String(fd.get('password') || '').trim();

  if (!email || !password) {
    showMessage('Completa ambos campos para continuar.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showMessage('Ingresa un correo válido.', 'error');
    return;
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    showMessage('Credenciales incorrectas. Verifica tu email y contraseña.', 'error');
    return;
  }

  // Guarda la sesión con el email y la fecha/hora de ingreso.
  saveSession({ email, loggedAt: new Date().toISOString() });
  showMessage('Inicio de sesión correcto. Redireccionando...', 'success');

  // Pequeña pausa para que el usuario vea el mensaje de éxito antes de redirigir.
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
}

loginForm.addEventListener('submit', handleLogin);
