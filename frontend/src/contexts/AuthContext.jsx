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
      const { errors } = await res.json();
      if (Array.isArray(errors) && errors.length > 0) {
          throw new Error(errors[0].msg || 'Falha no cadastro');
      }
      throw new Error('Falha no cadastro');
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

  /**
   * Solicita um token de recuperação de senha.  Envia o email para o
   * endpoint /auth/forgot-password.  Retorna mensagem e token (somente
   * para fins de demonstração – em produção o token seria enviado por email).
   */
  const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao solicitar recuperação');
    }
    return data;
  };

  /**
   * Efetua a redefinição de senha.  Envia o token e a nova senha para
   * /auth/reset-password.  Retorna mensagem de sucesso.
   */
  const resetPassword = async (token, password) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao redefinir senha');
    }
    return data;
  };

  /**
   * Recupera o perfil do usuário autenticado.  Faz GET em /auth/me e
   * retorna o objeto usuário sem campos sensíveis.
   */
  const getProfile = async () => {
    if (!token) {
      throw new Error('Não autenticado');
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao carregar perfil');
    }
    return data;
  };

  /**
   * Atualiza o perfil do usuário autenticado.  Aceita objeto com campos
   * opcionais: name, email, password, currentPassword.  Faz PUT em /auth/me.
   * Retorna mensagem e user atualizado.
   */
  const updateProfile = async (updates) => {
    if (!token) {
      throw new Error('Não autenticado');
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || 'Falha ao atualizar perfil');
    }
    // Atualiza o usuário no estado local para refletir eventuais mudanças de nome/email
    if (data.user) {
      setUser((prev) => {
        if (prev) {
          return { ...prev, name: data.user.name, email: data.user.email };
        }
        return prev;
      });
    }
    return data;
  };

  /**
   * Altera a senha do usuário autenticado.  Requer a senha atual e a nova senha.
   * Utiliza o endpoint /auth/change-password (POST) e, ao concluir, zera
   * a flag de mustChangePassword no servidor.  Não atualiza o token JWT pois
   * o id e email permanecem inalterados.
   */
  const changePassword = async (currentPassword, newPassword) => {
    if (!token) {
      throw new Error('Não autenticado');
    }
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Falha ao alterar senha');
    }
    return data;
  };

  const isAuthenticated = Boolean(token);

  const contextValue = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      getProfile,
      updateProfile,
      changePassword,
    }),
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