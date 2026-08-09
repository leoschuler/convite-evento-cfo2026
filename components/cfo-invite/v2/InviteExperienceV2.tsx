"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { PLATES } from "@/lib/media";
import type { Invitation } from "@/lib/types";

import AcceptInvitation from "../AcceptInvitation";
import AccessReveal from "../AccessReveal";
import BackgroundAtmosphere from "../BackgroundAtmosphere";
import ConciergeSection from "../ConciergeSection";
import CustomCursor from "../CustomCursor";
import InvitationStory from "../InvitationStory";
import InviteGate from "../InviteGate";
import InviteHeader from "../InviteHeader";
import Metamorphosis from "../Metamorphosis";
import PersonalizedTicket from "../PersonalizedTicket";
import PremiumFooter from "../PremiumFooter";
import ReservationStatus from "../ReservationStatus";
import ScrollProgress from "../ScrollProgress";
import SmoothScroll from "../SmoothScroll";
import TheExperience from "../TheExperience";
import TopicsMarquee from "../TopicsMarquee";
import VipExperience from "../VipExperience";
import WhyYou from "../WhyYou";
import { InviteProvider, useInvite } from "../InviteProvider";

import ConfirmationCinematic from "./ConfirmationCinematic";
import ErickMessageV2 from "./ErickMessageV2";
import GalleryScroll from "./GalleryScroll";
import HeroCinematic from "./HeroCinematic";
import Plate from "../Plate";
import RoomSequence from "./RoomSequence";
import SpeakerGallery from "./SpeakerGallery";
import VenueReveal from "./VenueReveal";

export default function InviteExperienceV2({ invitation }: { invitation: Invitation }) {
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
        <HeroCinematic />

        {/* Capítulo 01 — a credencial acompanha a leitura */}
        <Container>
          <div className="lg:grid lg:grid-cols-[1fr_minmax(300px,400px)] lg:gap-20">
            <InvitationStory />
            <div className="hidden lg:block">
              <div className="sticky top-0 flex h-screen items-center">
                <PersonalizedTicket />
              </div>
            </div>
            <div className="mx-auto max-w-[420px] pb-[10vh] lg:hidden">
              <PersonalizedTicket />
            </div>
          </div>
        </Container>

        <Metamorphosis />

        <Container>
          <WhyYou />
        </Container>

        <RoomSequence />

        <VenueReveal />

        <SpeakerGallery />

        <TopicsMarquee />

        <GalleryScroll />

        <Container>
          <TheExperience />
          <ErickMessageV2 />
        </Container>

        {/* Reveal do valor sobre a imagem do palco */}
        <div className="relative overflow-hidden">
          <Plate
            src={PLATES.access.src}
            alt={PLATES.access.alt}
            parallax={7}
            className="absolute inset-0 h-full w-full opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-void/70 to-void" aria-hidden />
          <Container>
            <AccessReveal />
          </Container>
        </div>

        <Container>
          <VipExperience />
          <ReservationStatus />
        </Container>

        {status === "ACCEPTED" ? (
          <ConfirmationCinematic />
        ) : (
          <Container>
            <AcceptInvitation />
          </Container>
        )}

        <Container>
          <ConciergeSection />
        </Container>

        <PremiumFooter />
      </main>
    </>
  );
}
