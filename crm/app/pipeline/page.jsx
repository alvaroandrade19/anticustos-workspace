import { revalidatePath } from 'next/cache';
import { listarPipeline, moverEstagio, ESTAGIOS } from '@/lib/negocios';
import { brl } from '@/lib/fmt';

export const dynamic = 'force-dynamic';

const ROTULO = {
  lead: 'Lead', contato_feito: 'Contato feito', diagnostico_agendado: 'Diagnóstico agendado',
  diagnostico_realizado: 'Diagnóstico realizado', proposta_enviada: 'Proposta enviada',
  fechado: 'Fechado', perdido: 'Perdido',
};

async function mudarEstagio(formData) {
  'use server';
  await moverEstagio(formData.get('id'), formData.get('estagio'));
  revalidatePath('/pipeline');
  revalidatePath('/');
}

export default async function Pipeline() {
  const negocios = await listarPipeline();

  if (!negocios.length) {
    return (
      <div className="crm-page">
        <div className="card"><div className="card-b microcaps">
          Nenhum negócio ainda. Rode <b className="fg">npm run importar-prospeccao</b> ou{' '}
          <b className="fg">npm run sincronizar-quiz</b> pra popular, ou configure{' '}
          <b className="fg">DATABASE_URL</b> se ainda não fez isso.
        </div></div>
      </div>
    );
  }

  return (
    <div className="crm-page">
      <div className="microcaps" style={{ marginBottom: 14 }}>{negocios.length} negócios</div>
      <div className="card scroll-x">
        <table className="tbl">
          <thead>
            <tr>
              <th>Empresa</th><th>Origem</th><th>Calor</th><th>Criativo</th>
              <th>Valor potencial</th><th>Estágio</th><th></th>
            </tr>
          </thead>
          <tbody>
            {negocios.map((n) => (
              <tr key={n.id}>
                <td className="fg">{n.nome_empresa}</td>
                <td>{n.origem}</td>
                <td>{n.nota_calor ?? '—'}</td>
                <td>{n.criativo ?? '—'}</td>
                <td>{n.valor_potencial ? brl(n.valor_potencial) : '—'}</td>
                <td>{ROTULO[n.estagio] || n.estagio}</td>
                <td>
                  <form action={mudarEstagio} style={{ display: 'flex', gap: 6 }}>
                    <input type="hidden" name="id" value={n.id} />
                    <select name="estagio" defaultValue={n.estagio} className="field">
                      {[...ESTAGIOS, 'perdido'].map((e) => (
                        <option key={e} value={e}>{ROTULO[e]}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn">Mover</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
