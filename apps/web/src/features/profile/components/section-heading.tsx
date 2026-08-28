import Image from "next/image";

export function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="profile-section-heading">
      <Image src={icon} alt="" width={22} height={22} />
      {title}
    </h2>
  );
}
