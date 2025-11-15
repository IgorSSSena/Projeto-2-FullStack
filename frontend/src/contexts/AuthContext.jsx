import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import jwtDecode from 'jwt-decode';

/**
 * Contexto de autenticação responsável por gerenciar sessão do usuário.
 *
 * O AuthProvider armazena o token JWT no localStorage e expõe funções
 * para login, registro e logout. Ele também decodifica o token para
 * obter informações do usuário (como id e email) e disponibiliza
 * essas informações através do hook useAuth. Todas as requisições
 * autenticadas utilizam o token no header Authorization.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Recupera token do localStorage ao iniciar.
    const stored = localStorage.getItem('auth_token');
    return stored || null;
  });
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        const decoded = jwtDecode(stored);
        return decoded;
      }
    } catch (err) {
      console.error('Erro ao decodificar token:', err);
    }
    return null;
  });

  // Define a base para as requisições HTTP
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  /**
   * Realiza o login do usuário. Recebe email e senha, envia para
   * /auth/login e armazena o token na sessão. Lança erro caso
   * as credenciais sejam inválidas.
   */
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || 'Falha no login');
    }
    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(jwtDecode(data.token));
    return data;
  };

  /**
   * Registra um novo usuário. Recebe nome, email e senha, envia para
   * /auth/register e armazena o token retornado.
   */
  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || 'Falha no cadastro');
    }
    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(jwtDecode(data.token));
    return data;
  };

  /**
   * Desloga o usuário, removendo o token do armazenamento e resetando o estado.
   */
  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  const contextValue = useMemo(
    () => ({ token, user, isAuthenticated, login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acessar as propriedades e funções de autenticação
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser utilizado dentro de AuthProvider');
  return ctx;
}