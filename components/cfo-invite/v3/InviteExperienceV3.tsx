"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { Invitation } from "@/lib/types";

import AcceptInvitation from "../AcceptInvitation";
import ConciergeSection from "../ConciergeSection";
import CustomCursor from "../CustomCursor";
import InvitationStory from "../InvitationStory";
import InviteGate from "../InviteGate";
import InviteHeader from "../InviteHeader";
import PersonalizedTicket from "../PersonalizedTicket";
import PremiumFooter from "../PremiumFooter";
import ReservationStatus from "../ReservationStatus";
import ScrollProgress from "../ScrollProgress";
import SmoothScroll from "../SmoothScroll";
import TopicsMarquee from "../TopicsMarquee";
import WhyYou from "../WhyYou";
import { InviteProvider, useInvite } from "../InviteProvider";

import AccessRealReveal from "./AccessRealReveal";
import AtmosphereBlue from "./AtmosphereBlue";
import ConfirmationReal from "./ConfirmationReal";
import ErickEarly from "./ErickEarly";
import EventGallery from "./EventGallery";
import EventPulse from "./EventPulse";
import FloatingAccept from "./FloatingAccept";
import HeroReal from "./HeroReal";
import NetworkingWall from "./NetworkingWall";
import SpeakersReal from "./SpeakersReal";
import TracksSection from "./TracksSection";

export default function InviteExperienceV3({ invitation }: { invitation: Invitation }) {
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
    const id = requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        // Bug interno do ScrollTrigger ao recalcular muitos triggers criados de uma vez.
      }
    });
    return () => cancelAnimationFrame(id);
  }, [entered]);

  return (
    <>
      <AtmosphereBlue />
      <SmoothScroll />
      <CustomCursor />
      <ScrollProgress />
      <InviteHeader />
      <InviteGate />
      <FloatingAccept />

      <main className="relative z-10">
        <HeroReal />

        {/* O recado do Erick vem antes de qualquer argumento de evento. */}
        <Container>
          <ErickEarly />
        </Container>

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

          <WhyYou />
        </Container>

        <EventPulse />

        <NetworkingWall />

        <SpeakersReal />

        <TracksSection />

        <TopicsMarquee />

        <EventGallery />

        <Container>
          <AccessRealReveal />
          <ReservationStatus />
        </Container>

        {status === "ACCEPTED" ? (
          <ConfirmationReal />
        ) : (
          <Container>
            <AcceptInvitation />
          </Container>
        )}
{/*
        <Container>
          <ConciergeSection />
        </Container>

        <PremiumFooter />
        */}
      </main>
    </>
  );
}
