# Revisão antes de entregar

1. Gere a folha de contato com **um segundo por cena** (ponha o instante no meio da frase, depois do morph):
   ```bash
   node scripts/contact-sheet.mjs Video 0.7 2.3 3.9 5.5 7.2 ... --colunas 9
   ```
2. Olhe cada quadro e responda:
   - A forma é **legível** sem a narração? (Se parece "nuvem", o morph está longo demais ou a forma é abstrata demais.)
   - Algo **sai da tela** ou encosta nas bordas?
   - A legenda disputa espaço com o desenho?
   - Há **texto sobrando** que não acrescenta?
   - A câmera se move entre cenas?
   - O protagonista aparece formado no **primeiro segundo**?
3. Corrija e gere a folha de novo só das cenas alteradas.
4. Depois do render, extraia alguns frames do MP4 final para confirmar.
5. Na entrega, diga ao usuário exatamente o que foi verificado (frames, medição de áudio) e o que **não** foi (assistir inteiro, ouvir as emendas).
