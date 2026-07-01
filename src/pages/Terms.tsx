import { LegalLayout } from "@/components/LegalLayout"

export default function Terms() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="Junho de 2026">
      <p>
        Ao usar o Invitly, você concorda com estes Termos. Leia com atenção.
      </p>

      <div>
        <h2>1. O serviço</h2>
        <p>
          O Invitly permite criar convites digitais, compartilhá-los por link e
          receber confirmações de presença. Criar e personalizar é gratuito; a
          publicação de convites pode ser paga.
        </p>
      </div>

      <div>
        <h2>2. Sua conta</h2>
        <p>
          Você é responsável por manter a segurança da sua conta e por todo o
          conteúdo que criar. Deve ter capacidade legal para aceitar estes
          Termos.
        </p>
      </div>

      <div>
        <h2>3. Pagamentos</h2>
        <p>
          Os pagamentos são processados pela Kiwify. Valores e condições são
          exibidos antes da compra. Reembolsos seguem a política aplicável e a
          legislação de defesa do consumidor.
        </p>
      </div>

      <div>
        <h2>4. Conteúdo do usuário</h2>
        <p>
          Você mantém a titularidade do conteúdo que cria. É proibido publicar
          conteúdo ilegal, ofensivo, que viole direitos de terceiros (incluindo
          imagens sem autorização) ou que infrinja direitos autorais.
        </p>
      </div>

      <div>
        <h2>5. Uso aceitável</h2>
        <ul>
          <li>Não usar o serviço para spam ou fraude.</li>
          <li>Não tentar burlar limites, segurança ou pagamentos.</li>
          <li>Não sobrecarregar a infraestrutura de forma abusiva.</li>
        </ul>
      </div>

      <div>
        <h2>6. Limitação de responsabilidade</h2>
        <p>
          O serviço é fornecido “como está”. Não nos responsabilizamos por danos
          indiretos decorrentes do uso, na máxima extensão permitida por lei.
        </p>
      </div>

      <div>
        <h2>7. Cancelamento</h2>
        <p>
          Você pode encerrar sua conta a qualquer momento pela página “Minha
          conta”. Podemos suspender contas que violem estes Termos.
        </p>
      </div>

      <div>
        <h2>8. Contato</h2>
        <p>
          Dúvidas?{" "}
          <a className="text-primary underline" href="mailto:contato@invitly.com.br">
            contato@invitly.com.br
          </a>
          .
        </p>
      </div>
    </LegalLayout>
  )
}
