import { LegalLayout } from "@/components/LegalLayout"

export default function Privacy() {
  return (
    <LegalLayout title="Política de Privacidade" updatedAt="Junho de 2026">
      <p>
        Esta Política descreve como o Invitly ("nós") coleta, usa e protege os
        dados pessoais dos usuários e dos convidados, em conformidade com a Lei
        Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).
      </p>

      <div>
        <h2>1. Dados que coletamos</h2>
        <ul>
          <li>
            <strong>Conta:</strong> nome e e-mail informados no cadastro (ou via
            login Google).
          </li>
          <li>
            <strong>Convites:</strong> textos, datas, imagens e configurações que
            você cria.
          </li>
          <li>
            <strong>Confirmações (RSVP):</strong> nome e, opcionalmente, e-mail,
            telefone e recado dos convidados que confirmam presença.
          </li>
          <li>
            <strong>Uso:</strong> visualizações de convites de forma anonimizada
            (sem armazenar IP em texto).
          </li>
        </ul>
      </div>

      <div>
        <h2>2. Como usamos os dados</h2>
        <p>
          Para criar e exibir seus convites, registrar confirmações de presença,
          fornecer métricas ao organizador, processar pagamentos e melhorar o
          serviço.
        </p>
      </div>

      <div>
        <h2>3. Compartilhamento</h2>
        <p>
          Não vendemos seus dados. Utilizamos provedores para operar o serviço,
          como Supabase (banco de dados e autenticação) e Kiwify (pagamentos),
          que tratam os dados conforme suas próprias políticas.
        </p>
      </div>

      <div>
        <h2>4. Cookies</h2>
        <p>
          Usamos cookies e armazenamento local essenciais para autenticação e
          preferências (como idioma). Não usamos cookies de rastreamento
          publicitário.
        </p>
      </div>

      <div>
        <h2>5. Seus direitos (LGPD)</h2>
        <p>
          Você pode acessar, corrigir, exportar ou excluir seus dados a qualquer
          momento. A exclusão da conta remove permanentemente seus convites e as
          confirmações vinculadas — faça isso na página “Minha conta”.
        </p>
      </div>

      <div>
        <h2>6. Retenção</h2>
        <p>
          Mantemos seus dados enquanto sua conta existir ou conforme exigido por
          lei. Ao excluir a conta, os dados são apagados.
        </p>
      </div>

      <div>
        <h2>7. Contato</h2>
        <p>
          Dúvidas sobre privacidade? Fale com a gente:{" "}
          <a className="text-primary underline" href="mailto:contato@invitly.com.br">
            contato@invitly.com.br
          </a>
          .
        </p>
      </div>
    </LegalLayout>
  )
}
