34 ferramentas de IA instaladas no meu agente.

11 eram de outra pessoa.

E todas as 34 me cobravam em toda mensagem que eu mandava, inclusive as que eu nunca abri.

Cheguei nisso por uma resenha da Elisa Terumi sobre o paper "@skills: Attention Is All You Have" (Yin et al., arXiv:2608.12610), publicado em agosto. Funciona assim: o manual da ferramenta fica guardado no disco, mas o resumo dela fica colado em toda conversa. Precisa ficar, senão o agente nem sabe que ela existe.

É como ter 34 aplicativos mandando uma notificação antes de cada coisa que você vai fazer, só pra lembrar que estão instalados.

O custo medido pelos autores: de 50 a 280 tokens por ferramenta, em cada mensagem. Token é a unidade que o modelo lê, e que você paga.

Eles chamam isso de standing tax, algo como um imposto de prateleira: você paga aluguel por tudo que está na estante, inclusive o livro que nunca abriu.

O dinheiro é o menor dos problemas. O problema é atenção. São três efeitos ↓

→ a instrução vai ficando cada vez mais longe da pergunta que você fez, e o modelo obedece menos
→ você paga por ela também nas mil mensagens em que ela não serve pra nada
→ quanto mais instrução disputando espaço ao mesmo tempo, pior ele segue cada uma

Em uma frase: contexto maior não é contexto melhor.

A saída que os autores propõem é separar três decisões que a palavra "instalar" juntou numa só.

1. Preciso usar isso agora? Carrega na hora, não fica nada.
2. Preciso adaptar e guardar no meu projeto? Salva uma cópia, vira sua.
3. Preciso que funcione sozinha, sem eu pedir? Só aqui vale instalar.

A terceira resolve quase tudo. Se você sempre vai chamar a ferramenta pelo nome, ela não precisa estar instalada.

Fiz essa auditoria no meu ambiente esta semana. De 34 para 3, com medição antes e depois: cerca de 1.290 tokens a menos em toda mensagem que eu mando. Não apaguei nada, as outras 31 foram para uma pasta que o agente não lê.

Uma honestidade que o próprio paper registra e quase nenhum resumo dele menciona: os autores dizem que não provaram que esse modelo é melhor em todos os casos. É proposta bem argumentada, não lei.

O princípio do fecho eu adotaria de qualquer jeito. O que fica sempre no contexto é orçamento. Gaste só com o que precisa funcionar sozinho, o resto pode chegar na hora do uso.

Se você usa Claude Code, Cursor ou qualquer agente com skills, essa auditoria leva 10 minutos: abre a pasta, conta quantas estão instaladas e faz a pergunta 3 em cada uma. Me conta quantas sobraram, eu aposto que menos da metade.

Nota: da pesquisa à publicação, este post passou por automações que eu mesmo construí a partir das minhas anotações. O objetivo é sempre o mesmo: dividir o que ando estudando e puxar discussão boa no comentário.

#IA #Agentes #ClaudeCode #EngenhariaDeContexto
