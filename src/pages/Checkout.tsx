import { useParams } from "react-router-dom"

import { PagePlaceholder } from "@/components/PagePlaceholder"

export default function Checkout() {
  const { id } = useParams()
  return (
    <PagePlaceholder
      title="Pagamento"
      description={`Checkout via Kiwify para publicar o convite ${id}. Chega na Fase 3.`}
      backTo="/dashboard"
      backLabel="Voltar ao painel"
    />
  )
}
