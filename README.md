# Mariane Moreira Concept - Loja Virtual & Catálogo WhatsApp

Aplicação web moderna e responsiva para boutique de moda feminina, incluindo catálogo de peças exclusivas, filtro por categorias, seletor de tamanhos, sacola de compras integrada, checkout com envio de pedido formatado diretamente para o WhatsApp oficial e painel administrativo para gerenciamento completo do catálogo e horários.

---

## 📦 Como Colocar em um Novo Repositório no GitHub

Existem duas formas simples de enviar este projeto para o seu GitHub:

### Opção 1: Diretamente pelo Google AI Studio (Mais Rápido e Automático)
1. No canto superior direito da interface do **Google AI Studio**, clique no menu de opções (ícone de engrenagem / três pontinhos ou botão de compartilhamento/exportação).
2. Selecione **Export to GitHub**.
3. Autorize sua conta do GitHub se solicitado.
4. Escolha o nome do repositório desejado (exemplo: `mariane-moreira-concept`).
5. O AI Studio criará o repositório e fará o envio de todos os arquivos automaticamente.

---

### Opção 2: Exportar ZIP ou Via Linha de Comando (Git)
Se você baixou o código como arquivo ZIP através do menu do AI Studio:

1. **Crie um novo repositório no GitHub:**
   - Acesse [github.com/new](https://github.com/new).
   - Dê um nome ao repositório (ex: `mariane-moreira-concept`).
   - Mantenha como **Public** (ou Private) e **não** marque para inicializar com README (pois o projeto já possui).
   - Clique em **Create repository**.

2. **No seu computador (abra o terminal na pasta extraída do projeto):**
   ```bash
   # 1. Inicializar o repositório local
   git init

   # 2. Adicionar todos os arquivos
   git add .

   # 3. Criar o primeiro commit
   git commit -m "feat: lancamento do site Mariane Moreira Concept"

   # 4. Definir a branch principal como main
   git branch -M main

   # 5. Conectar ao seu repositório novo no GitHub (substitua com o seu link)
   git remote add origin https://github.com/SEU_USUARIO/mariane-moreira-concept.git

   # 6. Enviar para o GitHub
   git push -u origin main
   ```

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 18 ou superior instalado.
- Gerenciador de pacotes npm.

### Instalação e Execução
```bash
# Instalar dependências
npm install

# Iniciar o servidor em modo de desenvolvimento
npm run dev
```
O projeto estará rodando em `http://localhost:3000`.

### Build de Produção
```bash
npm run build
npm start
```

---

## 🔑 Acesso Administrativo (Painel da Loja)
- **Como acessar**: Role até o rodapé e clique em **Acesso da Boutique (Área do Dono)** ou adicione `#admin` na URL.
- **Usuário padrão**: `admin`
- **Senha padrão**: `admin123`
*(A senha pode ser alterada a qualquer momento na aba Segurança do painel).*
