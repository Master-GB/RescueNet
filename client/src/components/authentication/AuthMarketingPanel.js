import React from "react";
import TextType from "../ui/TextType";

export default function AuthMarketingPanel({ imageSrc, headlineText }) {
  const src =
    imageSrc ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB8pgLtXKgH8eZaLta-WXvR8zcp6Sj-iF8CU2OIFpEPNcVRTEIiYbmcH_rpZAKWsFvDNkivyPeBwAnEWd-8cemqajGOJ17vnKvy18OkJKyMvZNRimkEhApdKQsbZ8jOwfQtOxdxx_7h9f3-jRFINovS2vN7r3ETf6Mdv-x_uIWQTUTIAduBqjzaDNT_xDDNM5pdajxaC4pp0EfaxlVaEqiw6bfbc87abTJohwkQbEhOpjVKGPD-K-p9SMp3NArZI_apBhz1aZPd8UE";

  return (
    <section
      className="relative w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex items-center justify-center p-10 md:p-16 overflow-hidden"
      data-purpose="marketing-panel"
    >
      <div className="absolute inset-0 z-0">
        <img
          alt="Rescue Workers"
          className="w-full h-full object-cover"
          src={src}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 max-w-lg">
        <span
          className="block text-[10px] md:text-xs font-bold tracking-[0.2em] text-primary uppercase mb-6"
          data-purpose="sub-category"
        >
          Emergency Response Suite
        </span>

        <h1
          className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-8"
          data-purpose="main-headline"
        >
          <div className="h-20 md:h-28 lg:h-36 overflow-hidden flex items-start justify-start text-left">
            <TextType
              as="span"
              text={[headlineText]}
              typingSpeed={48}
              pauseDuration={10200}
              loop={false}
              showCursor={true}
              cursorCharacter="_"
              deletingSpeed={30}
              variableSpeed={false}
              cursorBlinkDuration={0.5}
              startOnVisible={true}
              className="text-on-surface"
            />
          </div>
        </h1>

        <p className="text-on-surface text-opacity-80 text-lg leading-relaxed" data-purpose="supporting-text">
          RescueNet keeps authentication strict so every action is tied to a verified responder, agency, or citizen account.
        </p>
      </div>
    </section>
  );
}
