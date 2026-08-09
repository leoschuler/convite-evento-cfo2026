"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { Invitation } from "@/lib/types";

import AcceptInvitation from "./AcceptInvitation";
import AccessReveal from "./AccessReveal";
import BackgroundAtmosphere from "./BackgroundAtmosphere";
import ConciergeSection from "./ConciergeSection";
import ConfirmationExperience from "./ConfirmationExperience";
import CustomCursor from "./CustomCursor";
import ErickMessage from "./ErickMessage";
import ImmersiveRoom from "./ImmersiveRoom";
import InvitationStory from "./InvitationStory";
import InviteGate from "./InviteGate";
import InviteHeader from "./InviteHeader";
import InviteHero from "./InviteHero";
import Metamorphosis from "./Metamorphosis";
import PersonalizedTicket from "./PersonalizedTicket";
import PremiumFooter from "./PremiumFooter";
import ReservationStatus from "./ReservationStatus";
import ScrollProgress from "./ScrollProgress";
import SmoothScroll from "./SmoothScroll";
import SpeakerExperience from "./SpeakerExperience";
import TheExperience from "./TheExperience";
import TopicsMarquee from "./TopicsMarquee";
import VipExperience from "./VipExperience";
import WhyYou from "./WhyYou";
import { InviteProvider, useInvite } from "./InviteProvider";

export default function InviteExperience({ invitation }: { invitation: Invitation }) {
  return (
    <InviteProvider invitation={invitation}>
      <Experience />
    </InviteProvider>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1280px] px-6 md:px-10 lg:px-16">{children}</div>;
}

function Experience() {
  const { entered, status } = useInvite();

  // As posições mudam quando o gate sai e o scroll é liberado.
  useEffect(() => {
    if (!entered) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [entered]);

  return (
    <>
      <BackgroundAtmosphere />
      <SmoothScroll />
      <CustomCursor />
      <ScrollProgress />
      <InviteHeader />
      <InviteGate />

      <main className="relative z-10">
        {/* Hero + Capítulo 01 — a credencial acompanha a leitura */}
        <Container>
          <div className="lg:grid lg:grid-cols-[1fr_minmax(300px,400px)] lg:gap-20">
            <div>
              <InviteHero>
                <div className="mt-14 max-w-[420px] lg:hidden">
                  <PersonalizedTicket />
                </div>
              </InviteHero>
              <InvitationStory />
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-0 flex h-screen items-center">
                <PersonalizedTicket />
              </div>
            </div>
          </div>
        </Container>

        <Metamorphosis />

        <Container>
          <WhyYou />
        </Container>

        <ImmersiveRoom />

        <SpeakerExperience />

        <TopicsMarquee />

        <Container>
          <TheExperience />
          <ErickMessage />
          <AccessReveal />
          <VipExperience />
          <ReservationStatus />
          {status === "ACCEPTED" ? <ConfirmationExperience /> : <AcceptInvitation />}
          <ConciergeSection />
        </Container>

        <PremiumFooter />
      </main>
    </>
  );
}
