# 🔐 Top Filmes - Guia Completo de Credenciais, Infraestrutura e Manutenção

> Este documento contém todas as informações essenciais, credenciais de acesso, configurações de banco de dados em nuvem (Turso), hospedagem (Vercel) e instruções passo a passo para futuras alterações no projeto **Top Filmes**.

---

## 📌 1. Links Oficiais do Projeto

| Recurso | Endereço / URL |
| :--- | :--- |
| **Site em Produção (Vercel)** | [https://topfilmes-six.vercel.app](https://topfilmes-six.vercel.app) |
| **Painel Administrativo** | [https://topfilmes-six.vercel.app/admin](https://topfilmes-six.vercel.app/admin) |
| **Tela de Login** | [https://topfilmes-six.vercel.app/login](https://topfilmes-six.vercel.app/login) |
| **Repositório GitHub** | [https://github.com/LeoLemosDevs/Projeto_Top_Filmes](https://github.com/LeoLemosDevs/Projeto_Top_Filmes) |
| **Painel Vercel** | [https://vercel.com/leolemosdevs/topfilmes](https://vercel.com/leolemosdevs/topfilmes) |
| **Painel Turso (Banco de Dados)** | [https://turso.tech](https://turso.tech) (Organização `leolemosdevs`) |
| **Ambiente Local** | [http://localhost:3000](http://localhost:3000) |

---

## 👤 2. Contas de Usuário Pré-Configuradas

### 👑 Conta Administrador (Acesso Total & Publicação de Filmes)
- **Nome de Usuário**: `leoadm`
- **E-mail**: `professorleolemos@gmail.com`
- **Senha**: `leo250778`
- **Nível de Acesso (Role)**: `ADMIN`
- **E-mail Confirmado**: Sim (`email_verified = 1`)
- **Permissões**: Publicar filmes (Google Drive, YouTube, embeds), escolher categorias da TV e gêneros, definir filmes em destaque na Home e excluir títulos.

### 👤 Conta de Usuário Padrão (Streaming & Favoritos)
- **Nome de Usuário**: `leojulhos`
- **E-mail**: `leojulhos@gmail.com`
- **Senha**: `123456`
- **Nível de Acesso (Role)**: `USER`
- **E-mail Confirmado**: Sim (`email_verified = 1`)
- **Permissões**: Assistir filmes, salvar na Minha Lista e ter histórico de reprodução salvo automaticamente.

---

## 🗄️ 3. Banco de Dados na Nuvem (Turso libSQL)

O banco de dados é hospedado no **Turso** (SQLite distribuído na borda, com latência mínima em São Paulo).

| Parâmetro | Valor Configurado |
| :--- | :--- |
| **Organização** | `leolemosdevs` |
| **Nome do Banco** | `top-filmes` |
| **Região** | `sa-east-1` (São Paulo / Brasil 🇧🇷) |
| **TURSO_DATABASE_URL** | `libsql://top-filmes-leolemosdevs.aws-sa-east-1.turso.io` |
| **TURSO_AUTH_TOKEN** | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ2OTU2NjEsImlkIjoiMDFhMWRjMjctMDMwMS03ODIxLTkxNDUtMTdiN2U0YjU2YTIwIiwia2lkIjoiR0JNOGVIdkpwVVY2bWVJNXZxQ1d0UzZVQXJ4Q1h5YnhYSEZET3BqZXZ1ayIsInJpZCI6IjhkNTIwZDAwLWYyODctNGZkOS1hYWNlLWM4MmE4ZTY5M2I5MyJ9.m5abhxYFlOHAvUReIC0Ceie7VqmLzXtFoS6sdqPWRX_olO3cDZClorPv7LXCsWmQJ971LxzJYgSSfX4ks8xZBw` |
| **Driver Utilizado** | `@libsql/client/web` (compatível com Serverless e Edge, 100% puro HTTP/fetch sem dependência de binários C++) |

---

## ⚙️ 4. Variáveis de Ambiente (Environment Variables na Vercel)

Para verificar ou alterar as variáveis na Vercel:
1. Acesse: [https://vercel.com/leolemosdevs/topfilmes/settings/environment-variables](https://vercel.com/leolemosdevs/topfilmes/settings/environment-variables)
2. As variáveis ativas são:

```env
# Banco de Dados Turso
TURSO_DATABASE_URL=libsql://top-filmes-leolemosdevs.aws-sa-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# Criptografia de Sessão JWT
JWT_SECRET=top_filmes_super_segredo_2026_xyz_producao

# Administrador Padrão
ADMIN_INITIAL_EMAIL=professorleolemos@gmail.com
ADMIN_INITIAL_PASSWORD=leo250778

# URL da Aplicação
NEXT_PUBLIC_APP_URL=https://topfilmes-six.vercel.app

# E-mail SMTP (Opcional - para envio real de e-mails via Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=professorleolemos@gmail.com
SMTP_PASS=sua_senha_de_aplicativo_google
SMTP_FROM="Top Filmes" <professorleolemos@gmail.com>
```

---

## 🔄 5. Como Fazer Alterações e Atualizar o Site

Todo o fluxo de atualização é automatizado com **CI/CD** entre o **GitHub** e a **Vercel**:

1. Faça as alterações desejadas no código local (em `d:\Projeto_LeoLemos\Projeto_Top_Filmes`).
2. Teste localmente executando `npm run dev` e abrindo `http://localhost:3000`.
3. Para publicar as alterações no site oficial da Vercel, basta rodar no terminal:
   ```bash
   git add .
   git commit -m "descreva a alteracao feita"
   git push origin main
   ```
4. A Vercel detectará o novo commit automaticamente, compilará o projeto e colocará a nova versão no ar em cerca de 40 segundos!

---

## 📱 6. Como Gerar o Aplicativo Android (Google Play Store)

O projeto está configurado para empacotamento com o **Capacitor**:

1. No arquivo `capacitor.config.json`, certifique-se de que a URL aponte para produção:
   ```json
   {
     "appId": "com.topfilmes.app",
     "appName": "Top Filmes",
     "webDir": "out",
     "server": {
       "url": "https://topfilmes-six.vercel.app",
       "cleartext": true
     },
     "android": {
       "allowMixedContent": true,
       "backgroundColor": "#0A0D14"
     }
   }
   ```
2. Para compilar o projeto Android:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
3. No **Android Studio**:
   - Vá no menu **Build > Generate Signed Bundle / APK**.
   - Selecione **Android App Bundle (.aab)**.
   - Use seu arquivo de chaves (`keystore.jks`) e envie o arquivo `.aab` gerado diretamente para o **Google Play Console**!
