# Painel movly. — parceiros associados

Aplicação separada (Vite + React) para **membros movly.** gerirem apenas **academias com cadastro de associado importado** (`acafAssociate.importSource === 'acaf_associates_xlsx'`). Unidades sem esse vínculo **não entram** na lista.

## Desenvolvimento

```bash
cd acaf-association
npm install
npm run dev
```

- Front: `http://127.0.0.1:5178` (proxy `/api` → API em `8787` por padrão; ajuste `vite.config.ts`).
- Login: mesma conta **admin** do console com acesso ao painel (grupo liberado no **Sistema → Grupos** após o seed da API).

## Produção

No **acaf-adm**, o módulo **Associações → ACAF** abre [https://acaf.sejamovly.com](https://acaf.sejamovly.com) em nova aba (link externo com ícone na sidebar).

## API

Rotas em `acaf-api`:

- `GET /api/acaf-association/units`
- `GET /api/acaf-association/units/:id`
- `PATCH /api/acaf-association/units/:id` (corpo `{ acafAssociate: { ... } }`)

Todas exigem JWT admin com acesso ao painel de parceiros.
