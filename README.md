# finance-manager-frontend

Frontend do gerenciador de finanças pessoais, para a API `finance-manager-backend`.

- Next.js (App Router) + TypeScript
- Autenticação com NextAuth (credenciais), com renovação automática do refresh token
- Tailwind CSS + DaisyUI, tema claro, escuro ou do sistema
- SWR para dados e Recharts para os gráficos

## Como rodar

```
cp .env.example .env.local     # preencha NEXTAUTH_SECRET (openssl rand -base64 48)
npm ci
npm run dev                    # http://localhost:3001
```

A API precisa estar no ar em `API_URL` (padrão `http://localhost:3000`, não a porta do
frontend). O navegador chama `/backend/*` e o Next repassa para a API, então o backend não
precisa de CORS. Atrás desse repasse a API enxerga o IP do servidor do Next; em produção,
configure `TRUST_PROXY=1` no backend para o rate limit usar o IP real do usuário.

Para criar o primeiro admin, use o seed do backend (`npm run seed`).

## Telas

| Rota | O que faz |
|---|---|
| `/login`, `/register` | Entrar e criar conta |
| `/` | Dashboard do mês: saldo, gasto, maior dia, média e gráficos |
| `/expenses` | Lista com filtro por mês e categoria, edição e exclusão |
| `/expenses/new` | Novo gasto, com comprovante e valor sugerido (sempre confirmado por você) |
| `/categories` | Categorias globais e próprias |
| `/income` | Salário de cada mês |
| `/users` | Gestão de contas (só admin) |

## Como a sessão funciona

O access token (15 min) e o refresh token ficam no cookie criptografado do NextAuth, nunca no
`localStorage`. A rota `/api/auth/session` renova o par quando faltam menos de 60 s, e o
navegador chama a API direto com o `Bearer`. Como a API rotaciona o refresh token (reusar um
token já trocado revoga a sessão), as renovações simultâneas dividem a mesma troca.

## Scripts

```
npm run dev     # desenvolvimento
npm run build   # build de produção
npm start       # serve o build
npm run lint
```
