# Prospector — como instalar e usar

**O que essa skill faz:** você fala o que vende e pra quem ("acha 5 clínicas de estética em
Goiânia que precisam de site", "encontra restaurantes em BH pra eu gerir o tráfego"), e ela faz a
**investigação técnica de cada lead** como um humano faria antes de abordar: olha o site (existe?
tá velho? é responsivo? tem pixel?), as redes, monta o link pra você conferir se a empresa
anuncia, descobre **quem decide** (nome do dono via Receita/registro do domínio, quando dá pra
confirmar) e junta os contatos — **WhatsApp, telefone, e-mail, Instagram**. No fim te entrega uma
**lista pronta + um dossiê por lead com um gancho de abordagem**, pra você só chamar com chance
alta de fechar.

Não é "puxar 3 nomes do Google". É a varredura que um prospector bom faz na mão — automatizada.

---

## Instalar (1 minuto, sem programar)

1. Pegue a pasta inteira `prospector` (a que tem o `SKILL.md` dentro).
2. Jogue ela dentro da pasta de skills do seu usuário:
   - **Windows:** `C:\Users\SEU-NOME\.claude\skills\`
   - **Mac/Linux:** `~/.claude/skills/`
   - Se a pasta `skills` não existir, crie ela.
3. Pronto. **Sem chave de API, não instala nada, não configura nada.**

> Skill instalada no usuário funciona em **qualquer projeto** que você abrir no Claude Code.
> Detalhe honesto: na 1ª busca o Claude pode pedir pra **liberar a busca na web** — é só permitir
> (não é configuração, é um toque). E pra confirmar se um lead **anuncia**, ela te manda um link
> pra você abrir (1 clique) — o Instagram e a Biblioteca de Anúncios bloqueiam leitura automática,
> então ela não finge que leu: te dá o link e é honesta sobre o que dá e o que não dá pra ler sozinho.

---

## Usar

Abre o Claude Code e faz **uma** das duas coisas:

- Digita o comando: **`/prospector`**
- Ou fala, em português normal:
  - *"acha 5 clientes pra mim que precisam de site em Curitiba"*
  - *"sou gestor de tráfego, encontra restaurantes em BH que já anunciam mas mal"*
  - *"preciso de leads de social media: lojas de roupa em Fortaleza com Instagram fraco"*
  - *"prospecta clínicas de estética em GO pra eu oferecer minha agência"*

Ela faz no máximo **1 pergunta** pra mirar certo (o que você vende e pra quem), aí investiga lead
por lead — leva um tempinho, vai te contando. No fim, a lista aparece na tela **e** fica salva em
`prospeccao/` dentro do seu projeto (um `.csv` pra importar no CRM + um dossiê pra ler).

---

## Sem a skill vs com a skill

- **Sem a skill:** o Claude te dá 3 nomes genéricos de empresa (muitas vezes inventados), sem
  checar se o site existe, sem contato confiável, sem saber quem decide. Você ainda tem que
  investigar tudo na mão.
- **Com a skill:** cada lead vem **investigado** — sinal real de oportunidade (com a evidência),
  decisor com nível de confiança (nunca um nome chutado), contatos com WhatsApp pronto, e um
  gancho de abordagem ancorado num fato verdadeiro do negócio. E uma lista que você **roda de novo**
  pra puxar o próximo lote sem repetir quem já achou.

---

## Detalhes que importam

- **Funciona no PRO** (US$20/mês). Ela é desenhada pra caber no limite do PRO — faz a varredura
  profunda nos melhores e marca os demais como "rasos, rode de novo pra aprofundar".
- **Não inventa.** Nome de dono, e-mail, telefone, "está anunciando" — se não dá pra confirmar de
  fonte pública, ela marca como **não confirmado** e te diz o passo manual. Nunca chuta.
- **Respeita a LGPD.** Trabalha só com dado público de empresa e te entrega o aviso + as regras pra
  prospectar dentro da lei (canal comercial, identificar-se, respeitar quem pede pra parar). Não é
  parecer jurídico.
- **Roda de novo quando quiser.** Puxa o próximo lote (pula quem já tá na lista), reconfere sinais,
  ou parte pra outra região/nicho.

---

## Depois da lista

**A planilha abre organizada no Excel** (separador certo pro Excel em português, acento sem quebrar,
nota como número pra você ordenar) e vem do lead mais quente pro mais frio. Campo que ela não
conseguiu confirmar fica **vazio**, e o que faltou está escrito na coluna de pendências — assim você
bate o olho e sabe o que é dado e o que é buraco.

**E os leads viram cards.** Rode a skill **CRM de Leads** (`/crm-leads`) que essa lista abre num
painel no seu computador: você arrasta cada lead de Novos pra Contatado, Proposta e Fechado, anota o
que rolou na conversa, marca quem é quente e quem pediu pra não ser procurado. Prospectou de novo
amanhã? Os leads novos caem no **mesmo painel**, sem duplicar e sem mexer no que você já organizou.

Escolheu um lead quente? O próximo passo dentro do pack é a skill **Geradora de Proposta**
(`/gerar-proposta`): aponta o dossiê do lead escolhido (já tem Negócio + Sinal + Gancho) e ela monta
a proposta sem você redigitar nada.
