import Image from "next/image";

type SiteBrandLogoProps = {
  /** Color: header sobre fondo claro. Blanco: footer sobre azul. */
  variant: "color" | "white";
  /** Header: altura contenida y ancho según viewport. Footer: proporción acorde al widget. */
  context: "header" | "footer";
  className?: string;
  priority?: boolean;
};

const SRC = {
  color: "/assets/imagenes/LogoHorizontalColor.png",
  white: "/assets/imagenes/LogoHorizontalBlanco.png"
} as const;

/**
 * Contenedor más estrecho que el asset + ligera escala para recortar márgenes laterales
 * típicos en PNGs y evitar “padding” visual extra.
 */
export function SiteBrandLogo({ variant, context, className, priority }: SiteBrandLogoProps): JSX.Element {
  const wrapper =
    context === "header"
      ? "h-9 w-[min(9.25rem,44vw)] sm:h-11 sm:w-[min(11.75rem,32vw)] lg:h-12 lg:w-[min(13rem,26vw)]"
      : "h-10 w-[min(10rem,72vw)] sm:w-[min(11.5rem,42vw)] md:w-[min(10rem,100%)]";

  const scale = context === "header" ? "scale-[1.11]" : "scale-[1.09]";
  const sizes =
    context === "header"
      ? "(max-width: 640px) 148px, (max-width: 1024px) 188px, 208px"
      : "(max-width: 640px) 160px, 184px";

  return (
    <span
      className={[
        "relative block shrink-0 overflow-hidden",
        wrapper,
        className ?? ""
      ].join(" ")}
    >
      <Image
        src={SRC[variant]}
        alt="EPR S.A."
        fill
        priority={priority}
        sizes={sizes}
        className={["object-contain object-center", scale].join(" ")}
      />
    </span>
  );
}
