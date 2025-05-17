---
id: plan-001
title: Integração Clerk no App Expo/React Native
createdAt: 2025-05-15
author: vitoracb
status: draft
---

## 🧩 Scope

Integrar o sistema de autenticação Clerk ao app Expo/React Native, garantindo login seguro, gerenciamento de sessão e proteção de rotas/telas sensíveis. O objetivo é permitir autenticação de usuários, registro, login social, logout e acesso seguro aos dados do app.

## ✅ Functional Requirements

- Permitir cadastro e login de usuários via Clerk (e-mail/senha e social login, se desejado)
- Proteger rotas/telas sensíveis para acesso apenas autenticado
- Gerenciar sessão do usuário (login/logout, persistência)
- Exibir dados do usuário autenticado (nome, e-mail, avatar)
- Sincronizar userId Clerk com dados do Supabase futuramente

## ⚙️ Non-Functional Requirements

- Performance: autenticação deve ser rápida e não bloquear a navegação
- Security: tokens e dados sensíveis protegidos, logout seguro
- Scalability: solução pronta para múltiplos usuários simultâneos

## 📚 Guidelines & Packages

- Seguir a documentação oficial do Clerk para React Native/Expo
- Utilizar o pacote: `@clerk/clerk-expo` (MIT License)
- Seguir boas práticas de segurança para armazenamento de tokens (SecureStore)
- Utilizar Context API ou Provider do Clerk para acesso global ao usuário

## 🔐 Threat Model (Stub)

- Vazamento de tokens de autenticação
- Acesso não autorizado a rotas/telas protegidas
- Sessão não expirada corretamente após logout

## 🔢 Execution Plan

1. Criar conta e projeto no Clerk (dashboard.clerk.com)
2. Instalar dependências: `@clerk/clerk-expo` e configurar no projeto Expo
3. Configurar ClerkProvider no entrypoint do app (ex: App.js ou _layout.tsx)
4. Implementar telas de login, cadastro e recuperação de senha usando componentes Clerk
5. Proteger rotas/telas sensíveis usando hooks/contexto do Clerk
6. Exibir dados do usuário autenticado na UI
7. Testar fluxos de login, logout, sessão expirada e proteção de rotas
8. (Opcional) Configurar login social (Google, Apple, etc.)
9. Documentar a integração e próximos passos para integração com Supabase
