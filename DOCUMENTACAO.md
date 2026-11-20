# 🎬 Plataforma Top Filmes (v2.1) - Documentação Técnica e Arquitetura

> **Versão Atual: `2.1.0`** (Tag Git: `v2.1.0` | Android `versionCode 3`, `versionName "2.1"`)
> Plataforma completa de streaming inspirada na experiência da Netflix, voltada para computadores e celulares Android (preparada para publicação na **Google Play Store**), utilizando **hospedagem gratuita na Vercel** e **banco de dados gratuito no Turso (libSQL)**.

### ✨ Novidades da Versão 2.1 (Sagas, Séries e Animes):
- **Sagas & Coleções (`/sagas` e `/sagas/[id]`)**: Área dedicada para agrupar franquias completas de filmes (ex: *Saga Alien*, *Saga Star Wars*, *Coleção Rambo*). Permite ao espectador navegar e maratonar os filmes em ordem cronológica com um clique.
- **Área para Séries com Temporadas e Episódios (`/series` e `/series/[id]`)**: Catálogo exclusivo para séries de TV organizadas por temporadas (`seasons`) e episódios (`episodes`), com sinopse, duração, miniaturas 16:9 e reprodutor com navegação anterior/próximo e gaveta lateral de episódios.
- **Área para Animes (`/animes`)**: Seção voltada aos fãs de animes com filtros de gênero (Shounen, Ação, Aventura, etc.), separação por arcos/temporadas e acompanhamento contínuo.
- **Reprodutor Especializado para Episódios (`/assistir-serie/[seriesId]/[episodeId]`)**: Integração de player multi-plataformas (TokyVideo com auto-conversor de ID, Dailymotion, Google Drive, YouTube, Ok.ru e MP4 direto), botões "Episódio Anterior" e "Próximo Episódio", e gaveta retrátil com todos os episódios para troca instantânea sem sair do vídeo.
- **Continuar Assistindo para Séries & Animes**: Tabela `series_history` que grava em tempo real o último episódio assistido e o segundo exato de parada, exibindo botão "Continuar de Onde Parou (T{x}:E{y})" na página da série.
- **Gestão Completa no Painel do ADM (`/admin`)**:
  - Nova aba **"Sagas & Coleções"**: criação de sagas com banner, pôster, sinopse e seleção/reordenação de filmes com setas para cima/baixo.
  - Nova aba **"Séries & Animes"**: criação de séries e animes, adição de temporadas e cadastro de episódios com resolução automática de links.
- **Navegação Expandida**: Navbar no desktop e BottomNav nos celulares agora possuem acesso direto a Início, Séries, Animes e Sagas.

### ✨ Recursos Consolidados da Versão 2.0:
- **Compartilhamento Social**: Botão de compartilhar filmes no Player, Modal e Banner.
- **Continuar de Onde Parou para Filmes**: Salva automaticamente o progresso no Turso DB e `localStorage`.
- **Painel Analytics & Tráfego para o ADM**: Métricas em tempo real e gráficos diários em `/admin`.
- **Hashtags & SEO Avançado para o Google**: Tags indexáveis e Schema.org `Movie` JSON-LD.
- **Curtidas nos Filmes**: Sistema interativo de likes com contador em tempo real.

---

## 📌 Sumário
1. [Visão Geral & Identidade Visual](#1-visão-geral--identidade-visual)
2. [Arquitetura e Tecnologias](#2-arquitetura-e-tecnologias)
3. [Gêneros e Categorias Nostálgicas da TV](#3-gêneros-e-categorias-nostálgicas-da-tv)
4. [Painel do Administrador & Publicação](#4-painel-do-administrador--publicação)
5. [Armazenamento e Reprodução com Custo Zero](#5-armazenamento-e-reprodução-com-custo-zero)
6. [Autenticação, Confirmação e Recuperação por E-mail](#6-autenticação-confirmação-e-recuperação-por-e-mail)
7. [Modelagem do Banco de Dados (Turso / libSQL)](#7-modelagem-do-banco-de-dados-turso--libsql)
8. [Configuração de Credenciais & Produção](#8-configuração-de-credenciais--produção)
9. [Fluxo de Manutenção e Atualização (CI/CD)](#9-fluxo-de-manutenção-e-atualização-cicd)
10. [Guia de Geração do Aplicativo Android (Google Play Store)](#10-guia-de-geração-do-aplicativo-android-google-play-store)

---

## 1. Visão Geral & Identidade Visual

A plataforma **Top Filmes** resgata a era de ouro do cinema e das grandes sessões de televisão (décadas de 70, 80, 90 e 2000), combinando nostalgia com uma interface ultra-moderna de streaming.

### 🎨 Paleta de Cores (Baseada na Logo Oficial `public/logo.png`):
- **Background Principal (`#0A0D14`)**: Dark cinema profundo e imersivo.
- **Superfície dos Cartões (`#121826` / `#1A2234`)**: Destaque com efeito moderno e sutil matiz azulada.
- **Amarelo Dourado (`#FFC700`)**: Cor de ação primária, botões "Assistir Agora", avaliações e badges de destaque.
- **Azul Royal Top Gun (`#1D52B8`)**: Contornos de foco, filtros de gênero e brilho neon suave.
- **Vermelho Estrela (`#E51D2A`)**: Barra de progresso do histórico, botão de favoritos ativo e badges de alerta.
- **Tipografia**: Máxima legibilidade em telas móveis e monitores ultrawide.

### 📀 Proporção das Capas de Filmes:
- **Formato Clássico DVD dos Anos 2000**: Proporção `2:3` com simulação da tradicional lombada e reflexo acrílico dos estojos de DVD.

---

## 2. Arquitetura e Tecnologias

- **Frontend & Backend**: Next.js 14+ (App Router, Server Components e Rotas de API Dinâmicas).
- **Estilização**: Tailwind CSS com suporte completo a temas escuros.
- **Banco de Dados Gratuito**: **Turso** (SQLite distribuído em nuvem, operando na região de São Paulo `sa-east-1`).
- **Driver de Conexão**: `@libsql/client/web` (opera via HTTP/Fetch nativo, garantindo 100% de compatibilidade em ambientes Serverless da Vercel sem depender de binários nativos C++).
- **Hospedagem Gratuita**: **Vercel** com deploy contínuo integrado ao GitHub.
- **Controle de Versão**: Git & GitHub ([https://github.com/LeoLemosDevs/Projeto_Top_Filmes](https://github.com/LeoLemosDevs/Projeto_Top_Filmes)).
- **Mobile**: Preparado com **Capacitor** e **PWA Manifest** para compilação Android (.apk e .aab).

---

## 3. Gêneros e Categorias Nostálgicas da TV

### 🎬 Gêneros Cadastráveis:
1. Ação
2. Policial
3. Faroeste
4. Guerra
5. Bíblico
6. Terror
7. Suspense
8. Clássicos
9. Drama
10. Comédia
11. Artes Marciais
12. Ficção Científica
13. Aventura
14. Anime
15. Desenho
16. Romance

### 📺 Categorias / Sessões da Página Inicial (17 Trilhos):
1. **Anos 70** (`anos-70`)
2. **Anos 80** (`anos-80`)
3. **Anos 90** (`anos-90`)
4. **Anos 2000** (`anos-2000`)
5. **Sessão da Tarde** (`sessao-da-tarde`)
6. **Temperatura Máxima** (`temperatura-maxima`)
7. **Tele Cine** (`tele-cine`)
8. **Super Cine** (`super-cine`)
9. **Sessão das 10** (`sessao-das-10`)
10. **Força Total** (`forca-total`)
11. **Corujão** (`corujao`)
12. **Intercine** (`intercine`)
13. **Clássicos** (`classicos`)
14. **Filmes Bíblicos** (`filmes-biblicos`)
15. **Faroeste** (`faroeste`)
16. **Guerra** (`guerra`)
17. **Comédia** (`comedia`)

---

## 4. Painel do Administrador & Edição de Filmes

O painel administrativo em `/admin` é restrito a contas com permissão `ADMIN`:
1. **Publicação Completa**:
   - **Título**: Nome do filme.
   - **Ano**: Ano de lançamento.
   - **Sinopse**: Enredo e resumo da obra.
   - **Gênero**: Seleção entre os gêneros oficiais (incluindo Bíblico e Faroeste).
   - **Capa do Filme**: URL da imagem na proporção 2:3 (DVD).
   - **Link do Vídeo**: Link do Google Drive, YouTube, Vimeo ou link direto MP4/HLS.
   - **Categorias**: Associação a uma ou múltiplas sessões da Home.
   - **Super Destaque**: Ativar exibição no banner principal do topo.
2. **Edição Completa de Filmes Existentes**:
   - Botão **Editar (Ícone de Lápis)** na listagem de filmes.
   - Carrega instantaneamente todos os dados do filme (inclusive as categorias já marcadas).
   - Ativa o **Modo Edição** com banner dourado de destaque e botão para **Cancelar Edição**.
   - Salva via `PUT /api/movies/[id]` com re-sincronização automática das categorias no banco de dados Turso.
3. **Gerenciamento e Exclusão**:
   - Monitoramento do total de visualizações por filme e exclusão com 1 clique (`DELETE /api/movies/[id]`).

---

## 5. Aplicativo Android & Botão de Download

1. **Botão de Download no Topo e no Rodapé**:
   - Botão destacado verde/esmeralda no topo da página (`Navbar`) com ícone animado de download.
   - Atalho rápido no menu inferior do celular (`BottomNav`).
2. **Página Oficial de Download (`/baixar-app`)**:
   - **Download do APK Direto (v1.0)** para instalação em celulares Android, Smart TVs e TV Box.
   - **Instalação Instantânea PWA**: Permite adicionar o Top Filmes como aplicativo na tela inicial sem precisar de downloads externos.
   - **Passo a passo ilustrado** ensinando o usuário a baixar e instalar o APK no Android.
   - **Status Google Play Store**: Informações sobre a publicação oficial na loja do Google.
3. **Compilação Automática via GitHub Actions (`.github/workflows/build-android.yml`)**:
   - Todo push na branch `main` executa um workflow no GitHub que compila:
     - `app-release.apk` (APK assinado pronto para uso direto).
     - `app-release.aab` (Android App Bundle para envio ao Google Play Console).

---

## 6. Armazenamento e Reprodução Multi-Plataformas com Custo Zero

Para permitir armazenamento gratuito ilimitado de mídia sem custos de servidor de streaming:
- **TokyVideo (Oficial & Localizado)**:
  - O sistema converte automaticamente links de visualização (`tokyvideo.com/br/video/slug`, `tokyvideo.com/video/slug` ou códigos de incorporação) para o endpoint de embed limpo (`tokyvideo.com/embed/slug`), contornando a restrição de `X-Frame-Options: SAMEORIGIN` e garantindo reprodução instantânea sem anúncios abusivos.
- **Dailymotion**:
  - Aceita links normais (`dailymotion.com/video/id`), links curtos (`dai.ly/id`) e embeds legados, convertendo-os para o player moderno (`geo.dailymotion.com/player.html?video=id&autoplay=1`).
- **Google Drive**:
  - O sistema converte automaticamente links compartilhados normais (`/view?usp=sharing`) para o formato embutido sem travamentos (`/preview`).
- **YouTube & Vimeo**:
  - Transforma links comuns, shorts ou encurtados em player embutido sem distrações.
- **Ok.ru (Odnoklassniki) & Internet Archive**:
  - Suporte nativo para acervos de filmes clássicos e dublados.
- **Extração Automática de Códigos `<iframe>`**:
  - Se o administrador colar o código HTML completo fornecido pela plataforma (ex: `<iframe src="..."></iframe>`), o sistema higieniza e extrai apenas a URL limpa.
- **Links Diretos (MP4 / HLS .m3u8)**:
  - Renderizados com player nativo HTML5 otimizado para reprodução contínua.
- **Botão de Origem no Player**:
  - Permite ao espectador abrir a transmissão diretamente no reprodutor externo com um clique se desejar.
- **Histórico Automático**:
  - Conforme o usuário assiste, o player salva o progresso e o filme passa a constar na fileira **"Continuar Assistindo"** com barra vermelha.

---

## 6. Autenticação, Confirmação e Recuperação por E-mail

- **Cadastro com Confirmação Obrigatória**:
  - Usuários novos são cadastrados com `email_verified = 0`.
  - Um e-mail com layout personalizado é enviado com o link de ativação (`/confirmar-email?token=...`).
  - O login é bloqueado até a confirmação, garantindo e-mails válidos.
- **Recuperação de Senha Segura**:
  - Em `/esqueci-senha`, o usuário solicita o link de redefinição.
  - O sistema gera um token temporário com validade de 1 hora.
  - Em `/redefinir-senha?token=...`, uma nova senha segura é criptografada com `bcrypt`.
- **Serviço de E-mail**: Utiliza `nodemailer` com suporte a Gmail SMTP (ou Brevo/SendGrid) e modo simulação em desenvolvimento.

---

## 7. Modelagem do Banco de Dados (Turso / libSQL)

```sql
-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'USER',
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Filmes
CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  synopsis TEXT NOT NULL,
  genre TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'embed',
  duration_minutes INTEGER DEFAULT 100,
  is_featured INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categorias da Home
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Relação Filme x Categoria (N:N)
CREATE TABLE IF NOT EXISTS movie_categories (
  movie_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (movie_id, category_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Favoritos (Minha Lista)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Histórico de Reprodução (Continuar Assistindo)
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

-- Sagas & Coleções (v2.1)
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  synopsis TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  backdrop_url TEXT DEFAULT '',
  is_featured INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Filmes Pertencentes à Saga na Ordem Cronológica
CREATE TABLE IF NOT EXISTS collection_movies (
  collection_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  order_index INTEGER DEFAULT 1,
  PRIMARY KEY (collection_id, movie_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Séries e Animes (v2.1)
CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  synopsis TEXT NOT NULL,
  genre TEXT NOT NULL,
  content_type TEXT DEFAULT 'SERIES', -- 'SERIES' ou 'ANIME'
  cover_image_url TEXT NOT NULL,
  backdrop_url TEXT DEFAULT '',
  release_year INTEGER NOT NULL,
  status TEXT DEFAULT 'EM_ANDAMENTO',
  is_featured INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  hashtags TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Temporadas das Séries/Animes
CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  season_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  synopsis TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(series_id, season_number),
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

-- Episódios das Temporadas
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL,
  series_id TEXT NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  synopsis TEXT DEFAULT '',
  duration_minutes INTEGER DEFAULT 45,
  thumbnail_url TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'embed',
  views_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(season_id, episode_number),
  FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);

-- Histórico de Episódios ("Continuar de Onde Parou" para Séries e Animes)
CREATE TABLE IF NOT EXISTS series_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  series_id TEXT NOT NULL,
  episode_id TEXT NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, series_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);
```

---

## 8. Configuração de Credenciais & Produção

### 👑 Contas Principais:
- **Admin**: `professorleolemos@gmail.com` | Senha: `leo250778`
- **Usuário**: `leojulhos@gmail.com` | Senha: `123456`

### 🌐 Endereços de Produção:
- **Site Oficial**: `https://topfilmes-six.vercel.app`
- **Banco Turso**: `libsql://top-filmes-leolemosdevs.aws-sa-east-1.turso.io`

Consulte o arquivo [CREDENCIAIS.md](CREDENCIAIS.md) para a lista exata de tokens e detalhes confidenciais de infraestrutura.

---

## 9. Fluxo de Manutenção e Atualização (CI/CD)

Sempre que realizar melhorias ou novas funcionalidades no projeto:
1. Edite os arquivos normalmente no seu editor.
2. Teste localmente com `npm run dev`.
3. Envie para o GitHub:
   ```bash
   git add .
   git commit -m "sua mensagem descritiva"
   git push origin main
   ```
4. A Vercel aplicará as alterações e colocará o site no ar de forma totalmente automatizada!

---

## 10. Guia de Geração do Aplicativo Android (Google Play Store)

1. Instale as dependências do Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```
2. Adicione a plataforma Android:
   ```bash
   npx cap add android
   ```
3. O arquivo `capacitor.config.json` já está apontando para o site oficial:
   ```json
   {
     "appId": "com.topfilmes.app",
     "appName": "Top Filmes",
     "webDir": "out",
     "server": {
       "url": "https://topfilmes-six.vercel.app",
       "cleartext": true
     }
   }
   ```
4. Abra no **Android Studio**:
   ```bash
   npx cap open android
   ```
5. No menu do Android Studio, gere o pacote assinado **Android App Bundle (.aab)** e envie para o **Google Play Console**!
