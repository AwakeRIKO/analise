# Analisador de Perfil Instagram

Uma aplicação web responsiva que permite aos usuários analisar perfis do Instagram e gerar orçamentos personalizados para serviços como seguidores, curtidas, comentários e visualizações.

## Funcionalidades

- Busca e análise de perfis do Instagram por @username
- Exibição de informações básicas (nome, bio, foto de perfil, número de seguidores, posts e taxa de engajamento)
- Carrossel com as últimas 6 publicações do perfil
- Catálogo de serviços com preços
- Seleção de pacotes para gerar orçamentos
- Compartilhamento do orçamento via WhatsApp

## Tecnologias Utilizadas

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion (animações)
- React Slick (carrossel)
- React Icons

### Backend
- Node.js
- Express
- Puppeteer (para scraping, se necessário)
- Axios

## Estrutura do Projeto

```
/
├── frontend/               # Código do cliente React
│   ├── public/             # Arquivos públicos
│   └── src/                # Código fonte
│       ├── components/     # Componentes React
│       ├── App.jsx         # Componente principal
│       └── main.jsx        # Ponto de entrada
│
└── backend/                # API Node.js/Express
    ├── server.js           # Servidor Express
    └── .env.example        # Exemplo de variáveis de ambiente
```

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Passos para Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd analisador-instagram
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
cp .env.example .env  # Crie o arquivo .env a partir do exemplo
```

3. Instale as dependências do frontend:
```bash
cd ../frontend
npm install
```

### Executando o Projeto

1. Inicie o servidor backend (em um terminal):
```bash
cd backend
npm run dev
```

2. Inicie o servidor frontend (em outro terminal):
```bash
cd frontend
npm run dev
```

3. Acesse a aplicação no navegador:
```
http://localhost:5173
```

## API Endpoints

### GET /api/profile/:username
Busca informações de um perfil do Instagram.

Exemplo de resposta:
```json
{
  "username": "ricardo_lpena",
  "fullName": "Ricardo Lpena",
  "bio": "Developer & Digital Creator | Compartilhando conhecimento sobre tecnologia e desenvolvimento",
  "profilePicture": "https://via.placeholder.com/150",
  "followersCount": 2345,
  "followingCount": 876,
  "postsCount": 128,
  "engagementRate": 0.045,
  "media": [
    {
      "url": "https://via.placeholder.com/500/8a3ab9/FFFFFF?text=Post+1",
      "type": "image",
      "likes": 187,
      "comments": 23
    },
    // ... mais imagens
  ]
}
```

### GET /api/services
Retorna o catálogo de serviços disponíveis.

Exemplo de resposta:
```json
{
  "followers": [
    { "qty": 1500, "price": 99.99 },
    { "qty": 3000, "price": 189.90 }
    // ... mais opções
  ],
  "likes": [
    { "qty": 500, "price": 45.00 },
    { "qty": 1000, "price": 60.00 }
  ],
  // ... outros serviços
}
```

## Configuração da API do Instagram (Opcional)

Para utilizar a API oficial do Instagram Graph em vez do scraping:

1. Crie uma conta de desenvolvedor no [Facebook Developers](https://developers.facebook.com/)
2. Registre um aplicativo e configure as permissões do Instagram
3. Obtenha seu token de acesso e adicione-o ao arquivo `.env` do backend

## Deployment

### Frontend
```bash
cd frontend
npm run build
```

### Backend (com frontend incorporado)
```bash
cd backend
NODE_ENV=production npm start
```

## Notas sobre Scraping (Quando não usar a API oficial)

Se você não tiver acesso à API oficial do Instagram, o projeto utiliza Puppeteer para scraping. Tenha em mente:

- O Instagram pode bloquear solicitações automatizadas frequentes
- As políticas do Instagram podem mudar, afetando o scraping
- Esta abordagem é apenas para fins educacionais

## Perfil de Teste

Use o perfil `@ricardo_lpena` para testar a aplicação com dados fictícios pré-configurados.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes. 