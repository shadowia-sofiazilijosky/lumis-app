import Image from "next/image";

export function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="profile-section-heading">
      {/* The source PNGs are 612x408 (landscape, not square) -- `fill` +
          object-fit: contain (in globals.css) keeps that real aspect ratio
          inside a fixed box instead of the old fixed 22x22, which
          stretched every one of them. */}
      <span className="profile-section-heading-icon">
        <Image src={icon} alt="" fill sizes="56px" />
      </span>
      {title}
    </h2>
  );
}
