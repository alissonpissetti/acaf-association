# Painel movly. — parceiros associados

Aplicação separada (Vite + React) para **membros movly.** gerirem apenas **academias com cadastro de associado importado** (`acafAssociate.importSource === 'acaf_associates_xlsx'`). Unidades sem esse vínculo **não entram** na lista.

## Desenvolvimento

```bash
cd acaf-association
npm install
npm run dev
```

- Front: `http://127.0.0.1:5178` (proxy `/api` → API em `8787` por padrão; ajuste `vite.config.ts`).
- Login: mesma conta **admin** do console; precisa da permissão `associacao.acaf.parceiros` (atribuída via grupos no **Sistema → Grupos** após o seed da API).

## Produção

Defina `VITE_ACAF_ASSOCIATION_URL` no build do **acaf-adm** para o URL público deste painel; o item de menu **Associação movly. → Parceiros associados** redireciona para lá.

## API

Rotas em `acaf-api`:

- `GET /api/acaf-association/units`
- `GET /api/acaf-association/units/:id`
- `PATCH /api/acaf-association/units/:id` (corpo `{ acafAssociate: { ... } }`)

Todas exigem JWT admin + permissão `associacao.acaf.parceiros`.
