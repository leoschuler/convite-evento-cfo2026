import { notFound } from "next/navigation";
import { getInvitation } from "@/lib/invitations.server";
import { PHOTOS } from "@/lib/media";
import InviteExperienceV3 from "@/components/cfo-invite/v3/InviteExperienceV3";
import StateScreen from "@/components/cfo-invite/StateScreen";

export const dynamic = "force-dynamic";

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
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

  return (
    <>
      {/* A janela de validação do gate é o momento certo para trazer o hero. */}
      <link rel="preload" as="image" href={PHOTOS.plenaria.src} fetchPriority="high" />
      <InviteExperienceV3 invitation={invitation} />
    </>
  );
}
