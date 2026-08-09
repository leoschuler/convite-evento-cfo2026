import { notFound } from "next/navigation";
import { getInvitation } from "@/lib/invitations.server";
import InviteExperience from "@/components/cfo-invite/InviteExperience";
import StateScreen from "@/components/cfo-invite/StateScreen";

/**
 * v1 congelada. Mesma rota, mesmos dados, experiência original sem camada de imagem.
 * Mantida para comparação — a rota viva é /guest/[slug].
 */
export const dynamic = "force-dynamic";

export default async function GuestPageV1({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  if (invitation.invite_status === "EXPIRED") {
    return (
      <StateScreen
        eyebrow="Invitation"
        title="Este convite não está mais reservado."
        support="Entre em contato com seu relacionamento no Grupo Pomin para verificar disponibilidade."
        footnote={`Guest / ${invitation.guest_id}`}
      />
    );
  }

  if (invitation.invite_status === "CANCELLED") {
    return (
      <StateScreen
        eyebrow="Invitation"
        title="Este convite não está mais ativo."
        support="Se você acredita que houve um engano, fale com seu contato no Grupo Pomin."
        footnote={`Guest / ${invitation.guest_id}`}
      />
    );
  }

  return <InviteExperience invitation={invitation} />;
}
