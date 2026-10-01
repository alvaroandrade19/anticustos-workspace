/*
 * captions.tsx: a legenda da fala, camada separada da cena.
 *
 * Padrão medido na referência de motion editorial (talking head vertical, frame a frame):
 *  - corte SECO no instante da palavra: 93% do bloco já no 1º quadro. A fluidez vem da cadência
 *    (~2,5 blocos/s), não de easing. Animar a entrada de um bloco de 0,3s gasta metade da vida dele.
 *  - blocos curtos (1 a 3 palavras), centralizados, uma linha quase sempre;
 *  - branco com sombra projetada; acento RARO (a palavra de ênfase aparece sozinha no bloco).
 * Os blocos chegam prontos do plano (scripts/plano.mjs): texto, quadro de entrada e de saída,
 * sem sobreposição e sem atravessar corte de cena. Aqui só se desenha.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from './theme';
import {FONT} from './text';

export type Bloco = {texto: string; from: number; to: number; enfase?: boolean};

export const CAP_Y = 0.7; // centro vertical do bloco (fração da altura); base segura do IG é 1580px

export const Legendas: React.FC<{blocos: Bloco[]}> = ({blocos}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const {ink, accent} = useTheme();
  const b = blocos.find((x) => frame >= x.from && frame < x.to);
  if (!b) return null;
  const base = width * 0.078; // ~84px a 1080: glifo ~57px, o corpo medido na referência
  const fs = b.enfase ? base * 1.35 : base;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* scrim: a vinheta da própria lente, só na faixa da legenda. No fundo escuro some; sobre
          multidão, grade ou vídeo separa a letra da imagem (sombra sozinha não basta, medido). Sem
          filter:blur: o gradiente já é macio e o desfoque custava render em todo quadro com legenda. */}
      <div style={{position: 'absolute', left: width * 0.04, right: width * 0.04, top: height * CAP_Y - fs * 1.1, height: fs * 2.2, borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 72%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 150, // botões do IG à direita
          top: height * CAP_Y,
          transform: 'translateY(-50%)',
          textAlign: 'center',
          fontFamily: `${FONT}, Impact, sans-serif`,
          fontSize: fs,
          lineHeight: 0.96,
          letterSpacing: '0.005em',
          textTransform: 'uppercase',
          color: b.enfase ? accent : ink,
          textShadow: '0 5px 14px rgba(0,0,0,0.62), 0 1px 3px rgba(0,0,0,0.5)',
        }}
      >
        {b.texto}
      </div>
    </AbsoluteFill>
  );
};
