# prova-do-problema.md — nenhum defeito entra sem prova (a regra mais dura da skill)

O pior erro possível desta skill não é achar poucos leads. É **entregar um problema que não existe**.
O usuário abre o link, vê que está tudo funcionando, e perde a confiança em todo o resto da lista —
inclusive nos leads que estavam certos. Um lead a menos custa pouco; um problema inventado custa a
credibilidade da lista inteira.

**Regra-mãe: se você não consegue mostrar ONDE o problema aparece, o problema não existe.**

---

## §1 — O teste dos três passos (todo defeito passa por ele)

Antes de escrever qualquer coisa em `sinal_oportunidade`:

1. **EVIDÊNCIA** — qual o dado bruto que você VIU? (o código de status que voltou, o trecho do HTML,
   a ausência da tag, o ano no rodapé, a página que devolveu erro). Se você só "deduziu", não passou.
2. **PROVA CLICÁVEL** — em que endereço exato o usuário reproduz isso em 10 segundos? Esse endereço
   vai no campo `prova_url`, e o que ele vai ver vai no `prova_nota`. **Sem prova clicável, não é
   defeito: é observação.**
3. **TESTE DO CONTRÁRIO** — tente derrubar o próprio achado. Pergunte: "existe explicação normal pra
   isso?" Se existe, o achado morre. É neste passo que quase todo falso positivo cai.

Não passou nos três? O achado **não vira sinal**. Vira uma linha em `pendencias` ("não consegui
confirmar X") ou simplesmente não existe. O lead sem defeito provado é MORNO no teto — e tudo bem.

---

## §2 — Lista negra: o que NÃO é problema (não invente dor com isto)

Estes são comportamentos NORMAIS da web. Nenhum deles, sozinho, é motivo pra abordar ninguém:

- **Redirecionamento (301, 302, 307, 308).** Domínio sem `www` que redireciona pro `www`, ou http
  que redireciona pra https, é **configuração correta** — o navegador segue sozinho e a pessoa chega
  no site. Uma resposta curta de redirecionamento ("Moved Permanently", ~300 bytes) NÃO é "uma página
  quebrada" nem "uma página técnica". **Sempre siga o redirecionamento antes de julgar qualquer
  coisa** e julgue o DESTINO. Se a cadeia terminar em 200, o site funciona. Ponto.
- **Página pequena.** Um HTML leve pode ser um site moderno bem-feito. Tamanho não é qualidade.
- **Site que não abre pra você mas abre no navegador.** Bloqueio anti-robô, WAF e resposta 403
  falam sobre VOCÊ, não sobre o site. Isso vai pra `pendencias`, nunca pra defeito.
- **Ausência de Google Analytics ou de pixel.** É sinal fraco e, sozinho, não é dor: muita empresa
  boa não mede nada e vive bem. Vale como reforço, nunca como o motivo principal do contato.
- **Site "antigo" pelo visual.** Gosto não é defeito. O que é defeito: não abrir no celular, erro,
  link quebrado, HTTPS inválido, conteúdo desatualizado que se PROVA (preço/horário/ano visíveis).
- **WordPress, Wix ou construtor de site.** Não é problema. Bilhões de sites bons rodam nisso.
- **PageSpeed baixo medido uma vez.** Medição keyless varia demais. Só use com número na mão e
  diga a fonte; nunca escreva "site lento" sem medição.
- **Não ter aparecido na sua busca.** Ausência de resultado é ausência de dado, não prova de nada.
- **CNPJ de outra empresa no registro do domínio.** É comum (agência registrou, holding registrou).
  Não é irregularidade, é dado pra confirmar — vai pra `pendencias`.
- **Certificado com nome diferente do domínio** só conta se o navegador realmente barrar. Confirme
  que a página não abre antes de chamar de erro de segurança.

---

## §3 — O que É defeito de verdade (e como cada um se prova)

| Defeito | Como se prova (o que você viu) | O que vai em `prova_url` |
|---|---|---|
| **Não tem site** | busca não acha domínio próprio; só perfil de rede ou diretório | o perfil/diretório onde ele existe |
| **Site fora do ar** | a cadeia inteira termina em erro (5xx, sem resposta, domínio não resolve) — testado nas versões com e sem www | o endereço que falha |
| **Não abre no celular** | HTML sem `<meta name="viewport">` **e** sem CSS responsivo | o próprio endereço |
| **HTTPS quebrado** | o navegador barra; certificado vencido ou de outro domínio E a página não carrega | o endereço https |
| **Página quebrada** | uma página interna importante devolve 404/500 (cardápio, contato, produtos) | a página que quebra |
| **Conteúdo desatualizado provado** | preço, horário, "promoção de <ano passado>" ou evento vencido VISÍVEL no conteúdo | a página com o dado velho |
| **Domínio parkeado / em construção** | a página final é da hospedagem ou "em breve" — **depois de seguir o redirecionamento** | o endereço final |
| **Sem canal de contato** | nenhum telefone, WhatsApp, e-mail ou formulário em nenhuma página lida | a página de contato (ou a home) |
| **Abandono nas redes** | último post visivelmente antigo, confirmado por busca (ver `raio-x-presenca.md`) | o perfil |
| **Reputação com problema** | nota baixa com volume relevante de avaliações, ou reclamações públicas | a página de avaliações |
| **Empresa irregular na Receita** | situação BAIXADA / INAPTA / SUSPENSA nos dados públicos | — (é dado de risco, e mostra que o lead é fraco) |

Um defeito só = sinal fraco. **Dois ou três defeitos independentes na mesma empresa** = sinal forte,
e é isso que faz um lead virar QUENTE.

---

## §4 — Como escrever o sinal (o que o usuário lê)

Fórmula: **o que está errado + onde se vê + por que dói pro negócio dele**. Concreto, sem adjetivo.

- Bom: *"A página do cardápio devolve erro 404. Quem clica em 'Cardápio' no menu não vê nada, e num
  restaurante esse é o clique que mais acontece antes de escolher onde jantar."*
- Ruim: *"Site desatualizado e com baixa performance, prejudicando a conversão."* (não diz o quê,
  não diz onde, não dá pra conferir)

E **o link que você mostra é o link do problema**, não a home bonita. Se o defeito está na página do
cardápio, `prova_url` é a página do cardápio. Foi exatamente esse descasamento que já queimou um
lead: o defeito estava num endereço e o painel mostrava outro, então parecia que a skill mentiu.

---

## §5 — Quando não achar defeito nenhum

Isso vai acontecer com a maioria dos negócios, e é o sistema funcionando. Nesse caso:
- o candidato **não entra** na lista final;
- se ele tem tudo a ver com o perfil mas está com a casa em ordem, ele pode entrar como MORNO com o
  sinal escrito honestamente: *"Não achei defeito no site. O encaixe é bom, mas não tenho um motivo
  concreto pra você abrir a conversa hoje."*
- **nunca** invente um defeito pequeno pra justificar a presença dele na lista. Preencher a lista com
  problema fabricado é o oposto do trabalho.
