# 🎬 Top Filmes

> Plataforma de streaming com os grandes clássicos do cinema e da televisão (Anos 70, 80, 90, 2000, Sessão da Tarde, Temperatura Máxima, Tele Cine, Super Cine e muito mais).

Desenvolvido para computadores e celulares Android (com suporte a empacotamento para a **Google Play Store**), utilizando **hospedagem gratuita na Vercel** e **banco de dados gratuito no Turso (libSQL)**.

---

## 🚀 Tecnologias

- **Frontend & Backend**: [Next.js 14+](https://nextjs.org) (App Router, Server Actions & API Routes)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com) com tema Dark Cinema e paleta da marca
- **Banco de Dados**: [Turso](https://turso.tech) (SQLite Serverless / libSQL) com fallback local automático
- **Autenticação**: Sessão JWT segura via cookies HttpOnly com hash `bcryptjs`
- **Vídeos**: Incorporação inteligente com custo zero de armazenamento (Google Drive, YouTube, Vimeo, MP4)
- **Mobile**: Pronto para empacotamento Android via **Capacitor**
- **Deploy**: [Vercel](https://vercel.com) com integração contínua (CI/CD) via [GitHub](https://github.com)

---

## 📖 Documentação Completa

Para instruções detalhadas de arquitetura, banco de dados, deploy na Vercel e publicação na Play Store, leia o arquivo [DOCUMENTACAO.md](DOCUMENTACAO.md).

---

## 🛠️ Como Iniciar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra `http://localhost:3000` no navegador.
   - O primeiro carregamento povoará automaticamente o catálogo com clássicos do cinema através do seed automático!
   - Painel do Administrador: `http://localhost:3000/admin` (Login: `admin@topfilmes.com` / Senha: `admin123456`)
