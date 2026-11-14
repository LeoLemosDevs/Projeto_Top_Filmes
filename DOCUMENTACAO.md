# 🎬 Plataforma Top Filmes - Documentação Oficial

Bem-vindo à documentação oficial do projeto **Top Filmes**, uma plataforma completa de streaming de filmes inspirada na experiência da Netflix, voltada para computadores e celulares Android (com geração futura de aplicativo para a Google Play Store).

---

## 📌 Sumário
1. [Visão Geral & Identidade Visual](#1-visão-geral--identidade-visual)
2. [Arquitetura e Tecnologias](#2-arquitetura-e-tecnologias)
3. [Gêneros e Categorias Nostálgicas](#3-gêneros-e-categorias-nostálgicas)
4. [Painel do Administrador & Publicação](#4-painel-do-administrador--publicação)
5. [Armazenamento e Reprodução com Custo Zero](#5-armazenamento-e-reprodução-com-custo-zero)
6. [Modelagem do Banco de Dados (Turso / libSQL)](#6-modelagem-do-banco-de-dados-turso--libsql)
7. [Passo a Passo de Instalação Local](#7-passo-a-passo-de-instalação-local)
8. [Deploy Gratuito na Vercel + Turso](#8-deploy-gratuito-na-vercel--turso)
9. [Guia de Geração do Aplicativo Android (Google Play Store)](#9-guia-de-geração-do-aplicativo-android-google-play-store)

---

## 1. Visão Geral & Identidade Visual

A **Top Filmes** foi construída para resgatar a era de ouro do cinema e das grandes sessões de televisão (anos 70, 80, 90 e 2000), aliando uma estética nostálgica com a mais moderna tecnologia de streaming web e mobile.

### 🎨 Paleta de Cores (Baseada na Logo `img/logo.jfif`):
- **Background Principal (`#0A0D14`)**: Dark cinema profundo e imersivo.
- **Superfície dos Cartões (`#121826` / `#1A2234`)**: Destaque sutil com visual moderno e refinado.
- **Amarelo Dourado (`#FFC700`)**: Cor de ação principal, botões de Play ("Assistir"), badges de destaque e avaliações.
- **Azul Royal Top Gun (`#1D52B8`)**: Contornos de foco, filtros ativos e faixas de destaque.
- **Vermelho Estrela (`#E51D2A`)**: Botão de favoritos ativo, badges de "Novo" / "Ao Vivo".
- **Texto Principal (`#FFFFFF`) / Secundário (`#94A3B8`)**: Máxima legibilidade em qualquer tela.

### 📀 Proporção da Capa dos Filmes (DVD Clássico dos Anos 2000):
- **Proporção**: `2:3` (Ex: `600x900px` ou `400x600px`), simulando a tradicional capa de estojo de DVD com cantos arredondados e efeito de relevo.

---

## 2. Arquitetura e Tecnologias

- **Framework Web**: Next.js 14+ (App Router) com TypeScript e Tailwind CSS.
- **Banco de Dados Gratuito**: **Turso** (SQLite distribuído em Edge com 9GB gratuitos no plano Hobby).
- **Driver de Conexão**: `@libsql/client` (compatível com conexão remota ao Turso e fallback automático para SQLite local).
- **Autenticação & Segurança**: Sessão JWT segura via cookies HttpOnly com hash `bcryptjs`, **confirmação obrigatória de conta via e-mail** e **recuperação de senha via e-mail** com tokens criptográficos temporários.
- **Serviço de E-mail**: `nodemailer` compatível com Gmail SMTP (ou Brevo / SendGrid / Mailtrap) e modo simulação com link direto em desenvolvimento.
- **Hospedagem Gratuita**: **Vercel** (Integração contínua com o repositório GitHub).
- **Mobile**: Preparado para **Capacitor** e **PWA (Progressive Web App)** para empacotamento em APK/AAB para a Google Play Store.

---

## 3. Gêneros e Categorias Nostálgicas

### 🎬 Gêneros Cadastráveis:
1. Ação
2. Policial
3. Faroeste
4. Terror
5. Suspense
6. Clássicos
7. Drama
8. Artes Marciais
9. Ficção Científica
10. Aventura
11. Anime
12. Desenho
13. Romance

### 📺 Categorias da Página Inicial (Trilhos Horizontais):
- **Anos 70**
- **Anos 80**
- **Anos 90**
- **Anos 2000**
- **Sessão da Tarde**
- **Temperatura Máxima**
- **Tele Cine**
- **Super Cine**
- **Sessão das 10**
- **Força Total**
- **Corujão**
- **Intercine**
- **Clássicos**

---

## 4. Painel do Administrador & Publicação

O painel administrativo acessível em `/admin` (restrito a usuários com permissão `ADMIN`) oferece:
1. **Publicação Rápida de Filmes**:
   - **Título**: Nome do filme.
   - **Ano**: Ano de lançamento (ex: 1985, 1999, 2004).
   - **Sinopse**: Descrição completa da trama.
   - **Gênero**: Seleção entre os 13 gêneros oficiais.
   - **Capa do Filme**: URL da imagem da capa de DVD.
   - **Link do Vídeo**: Link do Google Drive, YouTube, Vimeo, Dailymotion ou stream direto (MP4/m3u8).
   - **Categorias / Sessões**: Associação a uma ou mais categorias da página inicial.
   - **Destaque**: Opção para colocar o filme no banner principal do topo (Hero).
2. **Gerenciamento**:
   - Listagem completa com busca, contagem de visualizações, edição e exclusão.

---

## 5. Armazenamento e Reprodução com Custo Zero

Para economizar espaço em disco e evitar custos com servidores de mídia:
- **Google Drive**: O admin cola o link de compartilhamento comum (ex: `https://drive.google.com/file/d/ID/view?usp=sharing`). O sistema automaticamente converte e carrega o reprodutor embutido (`/preview`).
- **YouTube**: Transforma URLs tradicionais ou encurtadas (`youtu.be`) em reprodutor embutido com controles de visualização.
- **Links Diretos / Embeds**: Aceita links de CDNs gratuitas, Archive.org e servidores externos de vídeo.
- **Histórico Automático**: Conforme o usuário assiste, o player registra o progresso e o filme passa a constar na fileira **"Continuar Assistindo"**.

---

## 6. Modelagem do Banco de Dados (Turso / libSQL)

```sql
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'USER', -- 'USER' ou 'ADMIN'
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Filmes
CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  synopsis TEXT NOT NULL,
  genre TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'embed', -- 'gdrive', 'youtube', 'direct', 'embed'
  duration_minutes INTEGER DEFAULT 100,
  is_featured INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias da Home
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Tabela de Relação Filme x Categoria (N:N)
CREATE TABLE IF NOT EXISTS movie_categories (
  movie_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (movie_id, category_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tabela de Favoritos ("Minha Lista")
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Tabela de Histórico ("Continuar Assistindo")
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);
```

---

## 7. Passo a Passo de Instalação Local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env.local`:
   ```env
   # Se não definir Turso, a aplicação roda com banco local SQLite automático (topfilmes.db)
   TURSO_DATABASE_URL=
   TURSO_AUTH_TOKEN=

   JWT_SECRET=top_filmes_super_segredo_jwt_2026
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. Inicialize os dados com o seed inicial:
   - Inicie o servidor:
     ```bash
     npm run dev
     ```
   - Acesse `http://localhost:3000/api/seed` no navegador para criar automaticamente as 13 categorias e filmes de teste!
4. Acesse:
   - **Plataforma Web**: `http://localhost:3000`
   - **Painel Admin**: `http://localhost:3000/admin` (Conta padrão: `admin@topfilmes.com` / Senha: `admin123456`)

---

## 8. Deploy Gratuito na Vercel + Turso

### A. Criando o Banco no Turso (Grátis):
1. Acesse [turso.tech](https://turso.tech) e crie uma conta gratuita.
2. Crie seu banco de dados com nome `top-filmes`:
   ```bash
   # Via CLI ou painel web do Turso:
   turso db create top-filmes
   turso db show top-filmes --url
   turso db tokens create top-filmes
   ```

### B. Subindo no GitHub:
```bash
git add .
git commit -m "feat: lancamento inicial da plataforma top filmes"
git remote add origin https://github.com/SEU_USUARIO/top-filmes.git
git branch -M main
git push -u origin main
```

### C. Publicando na Vercel:
1. Acesse [vercel.com](https://vercel.com) e conecte o repositório GitHub `top-filmes`.
2. Em **Environment Variables**, adicione:
   - `TURSO_DATABASE_URL` = (sua URL libsql do Turso)
   - `TURSO_AUTH_TOKEN` = (seu token gerado no Turso)
   - `JWT_SECRET` = (chave aleatória de 32 caracteres)
3. Clique em **Deploy**.
4. Após a conclusão, abra `https://seu-projeto.vercel.app/api/seed` uma única vez para semear as categorias no Turso!

---

## 9. Guia de Geração do Aplicativo Android (Google Play Store)

O projeto é 100% responsivo e pode ser empacotado para Android usando o **Capacitor**:

1. Instale o Capacitor no projeto:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Top Filmes" "com.topfilmes.app" --web-dir out
   ```
2. Adicione a plataforma Android:
   ```bash
   npx cap add android
   ```
3. No arquivo `capacitor.config.ts`, defina a URL de produção na Vercel ou o diretório de build:
   ```typescript
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.topfilmes.app',
     appName: 'Top Filmes',
     webDir: 'out',
     server: {
       url: 'https://seu-projeto.vercel.app',
       cleartext: true
     }
   };

   export default config;
   ```
4. Sincronize e abra no Android Studio:
   ```bash
   npx cap sync android
   npx cap open android
   ```
5. No **Android Studio**:
   - Ajuste o ícone do aplicativo utilizando a imagem `img/logo.jfif` através do assistente **File > New > Image Asset**.
   - No menu superior, vá em **Build > Generate Signed Bundle / APK**.
   - Escolha **Android App Bundle (.aab)**.
   - Selecione ou crie seu arquivo de chave (`keystore.jks`).
   - O Android Studio gerará o arquivo `.aab` pronto para upload na **Google Play Console**!
