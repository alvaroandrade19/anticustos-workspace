-- Schema mínimo do CRM Anti Custos. Rodar uma vez no Supabase (SQL editor) depois
-- que o projeto existir. Ver crm/docs/SPEC.md para o desenho completo.

create table if not exists negocios (
  id text primary key,                    -- cnpj (prospecção) ou id do quiz (ads) ou uuid (manual)
  nome_empresa text not null,
  origem text not null check (origem in ('prospeccao', 'ads', 'manual')),
  estagio text not null default 'lead' check (estagio in (
    'lead', 'contato_feito', 'diagnostico_agendado', 'diagnostico_realizado',
    'proposta_enviada', 'fechado', 'perdido'
  )),
  valor_potencial numeric,
  nota_calor int,                         -- só origem prospeccao
  criativo text,                          -- só origem ads (utm_content)
  cnpj text,
  lote text,                              -- só origem prospeccao
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  raw jsonb
);

create index if not exists idx_negocios_estagio on negocios (estagio);
create index if not exists idx_negocios_origem on negocios (origem);

-- clientes_ativos deriva de negocios (estagio = 'fechado' + flag de recorrência ativa,
-- decidir na implementação se vira coluna aqui ou tabela própria quando o churn existir).
