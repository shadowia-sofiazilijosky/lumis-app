import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

export const metadata = {
  title: "Sobre Lumis",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="prose-page">
        <h1>Sobre Lumis</h1>

        <p>
          Lumis nace de una idea simple: leer no debería sentirse como abrir
          un archivo. Cuando empezás un libro en la computadora, el
          teléfono o donde sea, tiene que sentirse como abrir un libro de
          verdad — con esa sensación de página que se da vuelta, de
          encontrar el lugar exacto donde lo dejaste, de tener tu propia
          biblioteca a mano en vez de una carpeta de PDFs sueltos.
        </p>

        <p>
          Por eso Lumis combina dos cosas que normalmente viven separadas:
          un lector universal que entiende PDF, EPUB, MOBI, CBR, CBZ y TXT
          por igual — con el mismo efecto de pasar página en cualquier
          formato, resaltados, notas al margen, y el marcapáginas exacto
          donde lo dejaste — y una estantería visual que podés armar y
          decorar como si fuera un rincón real de tu casa. Elegís el
          mueble, la pared de fondo, dónde va cada libro, qué plantita o
          lucecita le ponés al lado. No es una lista. Es tu espacio.
        </p>

        <p>
          El nombre viene de <em>&quot;lumen&quot;</em>, la unidad de luz. Nos gustó
          porque leer siempre fue, de alguna forma, encontrar luz: la de la
          lamparita a la noche, la de la pantalla cuando no podés parar un
          capítulo más, la que entra por la ventana en tu sillón favorito.
          Lumis quiere ser esa luz chiquita y personal que hace que volver
          a tu biblioteca sea un gusto, no un trámite.
        </p>

        <p>
          Este proyecto está pensado para gente que ama armar su espacio de
          lectura tanto como leer en sí — para quienes tienen una
          estantería guardada &quot;para algún día&quot; en Pinterest, para
          quienes anotan frases en los márgenes, para quienes creen que un
          libro bien guardado también es una forma de cariño. Si sos de
          esas personas, Lumis es tu rincón.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
