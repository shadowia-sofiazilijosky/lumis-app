import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";
import { getThemeCookie } from "@/shared/lib/theme-cookie";

export const metadata = {
  title: "Términos y condiciones — Lumis",
};

export default async function TermsPage() {
  const theme = await getThemeCookie();

  return (
    <>
      <SiteHeader initialTheme={theme} variant="solid" />
      <main className="prose-page">
        <h1>Términos y Condiciones de Uso</h1>
        <p className="prose-updated">Última actualización: 18 de agosto de 2026</p>

        <h2>1. Objeto</h2>
        <p>
          Los presentes Términos y Condiciones (los &quot;Términos&quot;) regulan el
          acceso y uso de Lumis (la &quot;Plataforma&quot; o el &quot;Servicio&quot;), una
          aplicación web que permite a los usuarios subir, organizar, leer y
          anotar libros digitales en formato PDF, EPUB, MOBI, CBR, CBZ y
          TXT, así como organizarlos visualmente en estanterías
          personalizables. El Servicio es operado desde la República
          Argentina.
        </p>

        <h2>2. Aceptación de los Términos</h2>
        <p>
          Al registrarte y/o utilizar Lumis, aceptás estos Términos en su
          totalidad. Si no estás de acuerdo con alguna disposición, no
          debés utilizar el Servicio. Nos reservamos el derecho de
          modificar estos Términos en cualquier momento, conforme se
          detalla en la Sección 7.
        </p>

        <h2>3. Registro y responsabilidad sobre la cuenta</h2>
        <p>
          Para usar Lumis debés crear una cuenta con un email y una
          contraseña válidos. Sos responsable de mantener la
          confidencialidad de tus credenciales de acceso y de todas las
          actividades que ocurran bajo tu cuenta. Debés notificarnos de
          inmediato ante cualquier uso no autorizado de tu cuenta. Lumis no
          se responsabiliza por pérdidas derivadas del uso indebido de tus
          credenciales por parte de terceros cuando dicho uso no sea
          atribuible a una falla del Servicio.
        </p>

        <h2>4. Contenido subido por el usuario</h2>
        <p>
          4.1. Lumis te permite subir archivos de libros digitales para tu
          uso personal. Sos el único responsable del contenido que subís a
          la Plataforma.
        </p>
        <p>
          4.2. Declarás y garantizás que contás con los derechos necesarios
          (ya sea por ser el autor, por haber adquirido una licencia
          legítima, por tratarse de una obra de dominio público, o por
          cualquier otra base legal válida) sobre todo archivo que subas.
        </p>
        <p>
          4.3. Lumis no aloja, distribuye, promociona ni verifica el
          contenido de los archivos subidos por los usuarios más allá de lo
          necesario para prestar el Servicio (almacenamiento privado y
          renderizado para tu propia lectura). Lumis no actúa como
          editorial ni como distribuidor de contenido y no otorga acceso a
          terceros sobre tus archivos.
        </p>
        <p>
          4.4. Queda prohibido subir contenido que infrinja derechos de
          propiedad intelectual de terceros, que sea ilegal, difamatorio, o
          que viole cualquier normativa aplicable. Lumis se reserva el
          derecho de eliminar contenido y/o suspender cuentas ante un
          reclamo fundado de infracción de derechos de autor o ante el
          incumplimiento de estos Términos.
        </p>
        <p>
          4.5. Los archivos que subís se almacenan de forma privada y solo
          son accesibles por vos a través de tu cuenta, salvo requerimiento
          legal válido.
        </p>

        <h2>5. Uso permitido del Servicio</h2>
        <p>
          Te comprometés a utilizar Lumis únicamente para fines lícitos y
          de acuerdo con estos Términos. Está prohibido: (a) intentar
          vulnerar la seguridad de la Plataforma; (b) utilizar el Servicio
          para distribuir contenido con derechos de autor ajenos sin
          autorización; (c) realizar ingeniería inversa, copiar o revender
          el Servicio; (d) utilizar bots o medios automatizados no
          autorizados para acceder a la Plataforma.
        </p>

        <h2>6. Limitación de responsabilidad</h2>
        <p>
          El Servicio se presta &quot;tal cual&quot; y &quot;según disponibilidad&quot;. Lumis
          no garantiza que el Servicio será ininterrumpido, libre de
          errores o que cumplirá con expectativas específicas del usuario.
          En la máxima medida permitida por la ley aplicable, Lumis no será
          responsable por daños indirectos, incidentales, especiales o
          consecuentes derivados del uso o la imposibilidad de uso del
          Servicio, incluyendo la pérdida de archivos, datos o contenido
          subido. Recomendamos conservar copias de respaldo de tus archivos
          originales fuera de la Plataforma.
        </p>

        <h2>7. Modificaciones del Servicio y de estos Términos</h2>
        <p>
          Nos reservamos el derecho de modificar, suspender o discontinuar
          el Servicio (total o parcialmente) en cualquier momento, con o
          sin previo aviso. Asimismo, podemos actualizar estos Términos
          periódicamente; los cambios significativos serán comunicados por
          los medios que consideremos razonables (por ejemplo, un aviso en
          la Plataforma). El uso continuado del Servicio luego de una
          modificación implica la aceptación de los Términos actualizados.
        </p>

        <h2>8. Cuenta y baja del Servicio</h2>
        <p>
          Podés solicitar la baja de tu cuenta en cualquier momento. Nos
          reservamos el derecho de suspender o cancelar cuentas que
          incumplan estos Términos, a nuestro criterio razonable y, cuando
          sea posible, con notificación previa.
        </p>

        <h2>9. Propiedad intelectual de la Plataforma</h2>
        <p>
          El software, diseño, marca &quot;Lumis&quot; y demás elementos propios de
          la Plataforma son propiedad de sus desarrolladores y están
          protegidos por la legislación de propiedad intelectual aplicable.
          Estos Términos no te otorgan ningún derecho sobre dichos
          elementos más allá del uso del Servicio conforme a lo aquí
          establecido.
        </p>

        <h2>10. Ley aplicable y jurisdicción</h2>
        <p>
          Estos Términos se rigen por las leyes de la República Argentina.
          Para cualquier controversia derivada de estos Términos o del uso
          del Servicio, las partes se someten a la jurisdicción de los
          tribunales ordinarios competentes de la Ciudad Autónoma de Buenos
          Aires, Argentina, con renuncia expresa a cualquier otro fuero o
          jurisdicción que pudiera corresponder.
        </p>

        <h2>11. Contacto</h2>
        <p>
          Ante cualquier consulta sobre estos Términos, podés escribirnos a{" "}
          <a href="mailto:sofiazilijosky@gmail.com">
            sofiazilijosky@gmail.com
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
