import { paths } from 'src/routes/paths';

import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      return null; // Token no es JWT (como Sanctum)
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    // Silenciosamente retornar null si no es un JWT válido
    return null;
  }
}

// ----------------------------------------------------------------------

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    // Sanctum tokens no tienen exp, siempre retornamos true si existe el token
    if (!decoded || !('exp' in decoded)) {
      return true;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    // Si hay error al decodificar, asumimos que es válido si existe (para Sanctum)
    return true;
  }
}

// ----------------------------------------------------------------------

export function tokenExpired(exp) {
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    try {
      alert('Token expired!');
      localStorage.removeItem('token');
      window.location.href = paths.auth.jwt.signIn;
    } catch (error) {
      console.error('Error during token expiration:', error);
      throw error;
    }
  }, timeLeft);
}

// ----------------------------------------------------------------------

export async function setSession(accessToken) {
  try {
    if (accessToken) {
      localStorage.setItem('token', accessToken);

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // Intentar decodificar solo si parece ser un JWT (tiene puntos)
      if (accessToken.includes('.')) {
        const decodedToken = jwtDecode(accessToken); // ~3 days by minimals server

        if (decodedToken && 'exp' in decodedToken) {
          tokenExpired(decodedToken.exp);
        }
      }
      // Sanctum tokens no tienen formato JWT, no necesitamos configurar expiración
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error during set session:', error);
    // Si falla la decodificación pero el token existe, continuamos
    // Esto permite usar tokens de Sanctum que no son JWT
  }
}
