import { notFound } from "next/navigation";
import { getInvitation } from "@/lib/invitations.server";
import { PLATES } from "@/lib/media";
import InviteExperienceV2 from "@/components/cfo-invite/v2/InviteExperienceV2";
import StateScreen from "@/components/cfo-invite/StateScreen";

/** v2 congelada — placas abstratas, sem fotografia real. Mantida para comparação. */
export const dynamic = "force-dynamic";

export default async function GuestPageV2({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);

  if (!invitation) notFound();

  if (invitation.invite_status === "EXPIRED" || invitation.invite_status === "CANCELLED") {
    return (
      <StateScreen
        eyebrow="Invitation"
        title="Este convite não está mais disponível."
        support="Entre em contato com seu relacionamento no Grupo Pomin."
        footnote={`Guest / ${invitation.guest_id}`}
      />
    );
  }

  return (
    <>
      <link rel="preload" as="image" href={PLATES.hero.src} fetchPriority="high" />
      <InviteExperienceV2 invitation={invitation} />
    </>
  );
}
