import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

export const metadata = {
  title: "Política de privacidad — Lumis",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="prose-page">
        <h1>Política de Privacidad</h1>
        <p className="prose-updated">Última actualización: 18 de agosto de 2026</p>

        <p>
          Esta Política de Privacidad describe cómo Lumis recolecta,
          utiliza, almacena y protege tus datos personales, en cumplimiento
          de la Ley N.º 25.326 de Protección de Datos Personales de la
          República Argentina y sus normas complementarias.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de los datos personales
          recolectados a través de Lumis puede ser contactado en{" "}
          <a href="mailto:sofiazilijosky@gmail.com">
            sofiazilijosky@gmail.com
          </a>
          .
        </p>

        <h2>2. Datos que recolectamos</h2>
        <p>Recolectamos los siguientes datos personales cuando usás Lumis:</p>
        <ul>
          <li>
            <strong>Datos de cuenta:</strong> dirección de email, nombre
            para mostrar y contraseña (almacenada de forma encriptada,
            nunca en texto plano).
          </li>
          <li>
            <strong>Archivos subidos:</strong> los libros digitales que
            subís a la Plataforma (PDF, EPUB, MOBI, CBR, CBZ, TXT) y los
            metadatos asociados (título, autor, portada).
          </li>
          <li>
            <strong>Datos de uso:</strong> progreso de lectura, resaltados,
            notas, reseñas, y la configuración de tus estanterías.
          </li>
          <li>
            <strong>Preferencias:</strong> tu preferencia de tema
            (claro/oscuro/sistema) y de modo de lectura.
          </li>
          <li>
            <strong>Datos técnicos:</strong> cookies de sesión estrictamente
            necesarias para mantenerte identificado (autenticación) y para
            recordar tu preferencia de tema.
          </li>
        </ul>

        <h2>3. Finalidad del tratamiento</h2>
        <p>Utilizamos tus datos exclusivamente para:</p>
        <ul>
          <li>Crear y administrar tu cuenta y permitirte iniciar sesión de forma segura.</li>
          <li>Almacenar y mostrarte tus libros, estanterías, progreso de lectura, resaltados y notas.</li>
          <li>Recordar tus preferencias de personalización (tema, modo de lectura).</li>
          <li>Mejorar y mantener el funcionamiento del Servicio.</li>
          <li>Comunicarnos con vos ante consultas o incidencias que nos plantees.</li>
        </ul>

        <h2>4. No venta ni cesión de datos a terceros</h2>
        <p>
          Lumis no vende, alquila ni comercializa tus datos personales ni el
          contenido de tus archivos a terceros. Tus datos solo se comparten
          con proveedores de infraestructura estrictamente necesarios para
          operar el Servicio (por ejemplo, almacenamiento en la nube y base
          de datos), quienes actúan como encargados del tratamiento bajo
          las instrucciones de Lumis y con las debidas garantías de
          confidencialidad y seguridad.
        </p>

        <h2>5. Cookies</h2>
        <p>
          Utilizamos cookies técnicas estrictamente necesarias para el
          funcionamiento del Servicio: una cookie de sesión para mantener
          tu inicio de sesión activo, y una cookie para recordar tu
          preferencia de tema claro/oscuro. No utilizamos cookies de
          publicidad ni de rastreo de terceros.
        </p>

        <h2>6. Seguridad de los datos</h2>
        <p>
          Adoptamos medidas técnicas y organizativas razonables para
          proteger tus datos personales contra el acceso no autorizado, la
          pérdida o la alteración, incluyendo el almacenamiento privado de
          archivos, contraseñas encriptadas y comunicación cifrada (HTTPS).
        </p>

        <h2>7. Derechos del titular de los datos (Derecho ARCO)</h2>
        <p>De acuerdo con la Ley N.º 25.326, tenés derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> solicitar información sobre qué datos personales tuyos tratamos.</li>
          <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o desactualizados.</li>
          <li><strong>Cancelación/Supresión:</strong> solicitar la eliminación de tus datos y de tu cuenta, incluyendo los archivos que hayas subido.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en los casos previstos por la ley.</li>
        </ul>
        <p>
          Podés ejercer estos derechos en cualquier momento escribiéndonos
          a{" "}
          <a href="mailto:sofiazilijosky@gmail.com">
            sofiazilijosky@gmail.com
          </a>
          . La Agencia de Acceso a la Información Pública, en su carácter
          de Órgano de Control de la Ley N.º 25.326, tiene la atribución de
          atender las denuncias y reclamos que se interpongan con relación
          al incumplimiento de las normas sobre protección de datos
          personales.
        </p>

        <h2>8. Conservación de los datos</h2>
        <p>
          Conservamos tus datos personales mientras mantengas tu cuenta
          activa. Si solicitás la baja de tu cuenta, tus datos y archivos
          serán eliminados de nuestros sistemas dentro de un plazo
          razonable, salvo que exista una obligación legal de conservarlos
          por más tiempo.
        </p>

        <h2>9. Menores de edad</h2>
        <p>
          Lumis no está dirigido a menores de 13 años. Si tomamos
          conocimiento de que hemos recolectado datos de un menor sin el
          consentimiento correspondiente, tomaremos las medidas necesarias
          para eliminarlos.
        </p>

        <h2>10. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente.
          Los cambios relevantes serán comunicados a través de la
          Plataforma.
        </p>

        <h2>11. Contacto</h2>
        <p>
          Para consultas sobre esta Política de Privacidad o para ejercer
          tus derechos, escribinos a{" "}
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
