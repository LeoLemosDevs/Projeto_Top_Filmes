# 🔐 Top Filmes - Documentação de Credenciais de Acesso

Documento oficial com as credenciais padrão configuradas para acesso aos ambientes de desenvolvimento local e produção da plataforma **Top Filmes**.

---

## 1. Conta Administrador (Acesso Total)

Essa conta possui privilégios de **ADMIN**, permitindo publicar filmes, gerenciar o catálogo, definir destaques e excluir títulos.

| Campo | Valor |
| :--- | :--- |
| **Nome / Usuário** | `leoadm` |
| **E-mail de Acesso** | `professorleolemos@gmail.com` |
| **Senha** | `leo250778` |
| **Nível de Acesso (Role)** | `ADMIN` |
| **URL do Painel Administrativo** | [http://localhost:3000/admin](http://localhost:3000/admin) |
| **URL de Login** | [http://localhost:3000/login](http://localhost:3000/login) |

### 🛠️ O que o Administrador pode fazer:
- Acessar o **Painel do Administrador** (`/admin`).
- Publicar novos filmes especificando:
  - Título, Ano, Sinopse, Gênero oficial.
  - Capa clássica no formato DVD dos anos 2000 (`2:3`).
  - Link de vídeo (Google Drive com conversão automática para embed, YouTube, Vimeo, MP4 direto).
  - Seleção das 13 categorias nostálgicas (Anos 70, 80, 90, 2000, Sessão da Tarde, Temperatura Máxima, Tele Cine, etc.).
  - Ativar banner em super destaque.
- Visualizar estatísticas de contagem de filmes e visualizações.
- Remover títulos do catálogo.

---

## 2. Conta de Usuário Padrão (Streaming & Navegação)

Essa conta representa um usuário padrão da plataforma com perfil estilo **Netflix**.

| Campo | Valor |
| :--- | :--- |
| **Nome / Usuário** | `leojulhos` |
| **E-mail de Acesso** | `leojulhos@gmail.com` |
| **Senha** | `123456` |
| **Nível de Acesso (Role)** | `USER` |
| **URL de Login** | [http://localhost:3000/login](http://localhost:3000/login) |

### 🎬 O que o Usuário pode fazer:
- Assistir aos filmes em modo cinema de alta imersão.
- Adicionar ou remover filmes da **"Minha Lista"** (Favoritos).
- Ter histórico de reprodução salvo automaticamente na fileira **"Continuar Assistindo"** com barra de progresso.
- Navegar pelas 13 categorias da TV e filtrar por qualquer um dos 13 gêneros.

---

## 3. Como Inicializar e Testar no Computador

1. Inicie o servidor local:
   ```bash
   npm run dev
   ```

2. Abra no seu navegador:
   - **Página Inicial**: [http://localhost:3000](http://localhost:3000)
   - **Página de Login**: [http://localhost:3000/login](http://localhost:3000/login)
   - **Painel Admin**: [http://localhost:3000/admin](http://localhost:3000/admin)

> [!NOTE]
> As senhas são armazenadas de forma criptografada usando **bcrypt** com 10 rounds de salt.
