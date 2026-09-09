# Na fila

Peças que já foram agendadas e estão esperando a hora de publicar. Uma pasta por peça,
dentro da pasta da rede.

Nada aqui é movido à mão. Quem coloca é o `agendar.js` de cada skill, e quem tira é o
`fila.js`: se o post sair, a peça vai para `conteudo/publicado/`; se o agendamento for
cancelado, ela volta para a área de produção de onde saiu.

Cada pasta tem um `_estado.md` com a rede, o horário marcado, o id na fila e o caminho
de origem. Se um agendamento falhar em definitivo, a peça fica aqui com estado `falhou`.
