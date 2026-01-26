import React, { useEffect, useState } from 'react';
import './TermsAndConditions.css';

const TermsAndConditions = ({ isOpen, onClose }) => {
    const [language, setLanguage] = useState('es');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'es' ? 'en' : 'es');
    };

    return (
        <div className="terms-overlay">
            <div className="terms-container">
                <header className="terms-header">
                    <button className="terms-back-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h2>{language === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions'}</h2>
                    <button
                        className="terms-lang-btn"
                        onClick={toggleLanguage}
                        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>
                </header>

                <div className="terms-content">
                    {language === 'en' ? <EnglishTerms /> : <SpanishTerms />}
                </div>
            </div>
        </div>
    );
};

// English Terms Component
const EnglishTerms = () => (
    <>
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last updated: November 05, 2024</p>

        <p>Please read these terms and conditions carefully before using Our Service.</p>

        <h2>Interpretation and Definitions</h2>
        <h3>Interpretation</h3>
        <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>

        <h3>Definitions</h3>
        <p>For the purposes of these Terms and Conditions:</p>
        <ul>
            <li><strong>Application</strong> means the software program provided by the Company downloaded by You on any electronic device, named PhotoDoc</li>
            <li><strong>Application Store</strong> means the digital distribution service operated and developed by Apple Inc. (Apple App Store) or Google Inc. (Google Play Store) in which the Application has been downloaded.</li>
            <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
            <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
            <li><strong>Country</strong> refers to: Brazil</li>
            <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Wiseminer Informatica LTDA, Rua Domingues de Sa, 293, sala 803, Icarai, Niteroi, RJ, Brazil.</li>
            <li><strong>Content</strong> refers to content such as text, images, or other information that can be posted, uploaded, linked to or otherwise made available by You, regardless of the form of that content.</li>
            <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
            <li><strong>Free Trial</strong> refers to a limited period of time that may be free when purchasing a Subscription.</li>
            <li><strong>In-app Purchase</strong> refers to the purchase of a product, item, service or Subscription made through the Application and subject to these Terms and Conditions and/or the Application Store's own terms and conditions.</li>
            <li><strong>Service</strong> refers to the Application.</li>
            <li><strong>Subscriptions</strong> refer to the services or access to the Service offered on a subscription basis by the Company to You.</li>
            <li><strong>Terms and Conditions</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</li>
            <li><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</li>
            <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
        </ul>

        <h2>Acknowledgment</h2>
        <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
        <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
        <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
        <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
        <p>Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.</p>

        <h2>Subscriptions</h2>
        <h3>Subscription period</h3>
        <p>The Service or some parts of the Service are available only with a paid Subscription. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of Subscription plan you select when purchasing the Subscription.</p>
        <p>At the end of each period, Your Subscription will automatically renew under the exact same conditions unless You cancel it or the Company cancels it.</p>

        <h3>Subscription cancellations</h3>
        <p>You can cancel the renewal of Your Subscription with the Application Store.</p>

        <h3>Billing</h3>
        <p>All billing is handled by the Application Store and is governed by the Application Store's own terms and conditions.</p>

        <h3>Fee Changes</h3>
        <p>The Company, in its sole discretion and at any time, may modify the Subscription fees. Any Subscription fee change will become effective at the end of the then-current Subscription period.</p>
        <p>The Company will provide You with reasonable prior notice of any change in Subscription fees to give You an opportunity to terminate Your Subscription before such change becomes effective.</p>
        <p>Your continued use of the Service after the Subscription fee change comes into effect constitutes Your agreement to pay the modified Subscription fee amount.</p>

        <h3>Refunds</h3>
        <p>Except when required by law, paid Subscription fees are non-refundable.</p>
        <p>The Application Store's refund policy will apply. If You wish to request a refund, You may do so by contacting the Application Store directly.</p>

        <h3>Free Trial</h3>
        <p>The Company may, at its sole discretion, offer a Subscription with a Free Trial for a limited period of time.</p>
        <p>You may be required to enter Your billing information in order to sign up for the Free Trial.</p>
        <p>If You do enter Your billing information when signing up for a Free Trial, You will not be charged by the Company until the Free Trial has expired. On the last day of the Free Trial period, unless You cancelled Your Subscription, You will be automatically charged the applicable Subscription fees for the type of Subscription You have selected.</p>
        <p>At any time and without notice, the Company reserves the right to (i) modify the terms and conditions of the Free Trial offer, or (ii) cancel such Free Trial offer.</p>

        <h3>Storage capacity and usage limitations</h3>
        <p>Each Subscription plan has a different storage capacity, based on the total number of photos stored.</p>
        <p>Subscription plans were not designed to use the Application as a simple camera, deleting photos immediately after they are shared, without the photo history being stored. This type of use ends up overloading the Application's resources. The Company reserves the right to limit the number of photos deleted to prevent abuse.</p>

        <h2>Contact Us</h2>
        <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
        <ul>
            <li>By email: info@photodoc.app</li>
        </ul>
    </>
);

// Spanish Terms Component
const SpanishTerms = () => (
    <>
        <h1>Términos y Condiciones</h1>
        <p className="last-updated">Última actualización: 05 de noviembre de 2024</p>

        <p>Por favor, lea estos términos y condiciones cuidadosamente antes de usar Nuestro Servicio.</p>

        <h2>Interpretación y Definiciones</h2>
        <h3>Interpretación</h3>
        <p>Las palabras cuya letra inicial está en mayúscula tienen significados definidos bajo las siguientes condiciones. Las siguientes definiciones tendrán el mismo significado independientemente de si aparecen en singular o en plural.</p>

        <h3>Definiciones</h3>
        <p>Para los propósitos de estos Términos y Condiciones:</p>
        <ul>
            <li><strong>Aplicación</strong> significa el programa de software proporcionado por la Compañía descargado por Usted en cualquier dispositivo electrónico, llamado PhotoDoc</li>
            <li><strong>Tienda de Aplicaciones</strong> significa el servicio de distribución digital operado y desarrollado por Apple Inc. (Apple App Store) o Google Inc. (Google Play Store) en el cual la Aplicación ha sido descargada.</li>
            <li><strong>Afiliado</strong> significa una entidad que controla, es controlada por o está bajo control común con una parte, donde "control" significa propiedad del 50% o más de las acciones, participación accionaria u otros valores con derecho a voto para la elección de directores u otra autoridad gerencial.</li>
            <li><strong>Cuenta</strong> significa una cuenta única creada para que Usted acceda a nuestro Servicio o partes de nuestro Servicio.</li>
            <li><strong>País</strong> se refiere a: Brasil</li>
            <li><strong>Compañía</strong> (referida como "la Compañía", "Nosotros", "Nos" o "Nuestro" en este Acuerdo) se refiere a Wiseminer Informatica LTDA, Rua Domingues de Sa, 293, sala 803, Icarai, Niteroi, RJ, Brasil.</li>
            <li><strong>Contenido</strong> se refiere a contenido como texto, imágenes u otra información que puede ser publicada, cargada, vinculada o puesta a disposición por Usted, independientemente de la forma de ese contenido.</li>
            <li><strong>Dispositivo</strong> significa cualquier dispositivo que pueda acceder al Servicio, como una computadora, un teléfono celular o una tableta digital.</li>
            <li><strong>Prueba Gratuita</strong> se refiere a un período de tiempo limitado que puede ser gratuito al comprar una Suscripción.</li>
            <li><strong>Compra en la Aplicación</strong> se refiere a la compra de un producto, artículo, servicio o Suscripción realizada a través de la Aplicación y sujeta a estos Términos y Condiciones y/o los propios términos y condiciones de la Tienda de Aplicaciones.</li>
            <li><strong>Servicio</strong> se refiere a la Aplicación.</li>
            <li><strong>Suscripciones</strong> se refieren a los servicios o acceso al Servicio ofrecidos sobre una base de suscripción por la Compañía a Usted.</li>
            <li><strong>Términos y Condiciones</strong> (también referidos como "Términos") significan estos Términos y Condiciones que forman el acuerdo completo entre Usted y la Compañía con respecto al uso del Servicio.</li>
            <li><strong>Servicio de Redes Sociales de Terceros</strong> significa cualquier servicio o contenido (incluyendo datos, información, productos o servicios) proporcionado por un tercero que puede ser mostrado, incluido o puesto a disposición por el Servicio.</li>
            <li><strong>Usted</strong> significa el individuo que accede o usa el Servicio, o la compañía, u otra entidad legal en nombre de la cual dicho individuo está accediendo o usando el Servicio, según corresponda.</li>
        </ul>

        <h2>Reconocimiento</h2>
        <p>Estos son los Términos y Condiciones que rigen el uso de este Servicio y el acuerdo que opera entre Usted y la Compañía. Estos Términos y Condiciones establecen los derechos y obligaciones de todos los usuarios con respecto al uso del Servicio.</p>
        <p>Su acceso y uso del Servicio está condicionado a Su aceptación y cumplimiento de estos Términos y Condiciones. Estos Términos y Condiciones se aplican a todos los visitantes, usuarios y otras personas que acceden o usan el Servicio.</p>
        <p>Al acceder o usar el Servicio, Usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos Términos y Condiciones, entonces no puede acceder al Servicio.</p>
        <p>Usted declara que es mayor de 18 años. La Compañía no permite que menores de 18 años usen el Servicio.</p>
        <p>Su acceso y uso del Servicio también está condicionado a Su aceptación y cumplimiento de la Política de Privacidad de la Compañía. Nuestra Política de Privacidad describe Nuestras políticas y procedimientos sobre la recopilación, uso y divulgación de Su información personal cuando Usted usa la Aplicación o el Sitio Web y le informa sobre Sus derechos de privacidad y cómo la ley lo protege. Por favor lea Nuestra Política de Privacidad cuidadosamente antes de usar Nuestro Servicio.</p>

        <h2>Suscripciones</h2>
        <h3>Período de suscripción</h3>
        <p>El Servicio o algunas partes del Servicio están disponibles solo con una Suscripción paga. Se le facturará por adelantado de forma recurrente y periódica (como mensual o anualmente), dependiendo del tipo de plan de Suscripción que seleccione al comprar la Suscripción.</p>
        <p>Al final de cada período, Su Suscripción se renovará automáticamente bajo las mismas condiciones exactas a menos que Usted la cancele o la Compañía la cancele.</p>

        <h3>Cancelaciones de suscripción</h3>
        <p>Puede cancelar la renovación de Su Suscripción con la Tienda de Aplicaciones.</p>

        <h3>Facturación</h3>
        <p>Toda la facturación es manejada por la Tienda de Aplicaciones y se rige por los propios términos y condiciones de la Tienda de Aplicaciones.</p>

        <h3>Cambios de tarifas</h3>
        <p>La Compañía, a su entera discreción y en cualquier momento, puede modificar las tarifas de Suscripción. Cualquier cambio en la tarifa de Suscripción entrará en vigencia al final del período de Suscripción actual.</p>
        <p>La Compañía le proporcionará un aviso previo razonable de cualquier cambio en las tarifas de Suscripción para darle la oportunidad de cancelar Su Suscripción antes de que dicho cambio entre en vigencia.</p>
        <p>Su uso continuo del Servicio después de que el cambio de tarifa de Suscripción entre en vigencia constituye Su acuerdo de pagar el monto de tarifa de Suscripción modificado.</p>

        <h3>Reembolsos</h3>
        <p>Excepto cuando lo requiera la ley, las tarifas de Suscripción pagadas no son reembolsables.</p>
        <p>Se aplicará la política de reembolsos de la Tienda de Aplicaciones. Si desea solicitar un reembolso, puede hacerlo contactando directamente a la Tienda de Aplicaciones.</p>

        <h3>Prueba gratuita</h3>
        <p>La Compañía puede, a su entera discreción, ofrecer una Suscripción con una Prueba Gratuita por un período de tiempo limitado.</p>
        <p>Es posible que se le solicite que ingrese Su información de facturación para registrarse en la Prueba Gratuita.</p>
        <p>Si ingresa Su información de facturación al registrarse en una Prueba Gratuita, no se le cobrará por la Compañía hasta que expire la Prueba Gratuita. En el último día del período de Prueba Gratuita, a menos que haya cancelado Su Suscripción, se le cobrará automáticamente las tarifas de Suscripción aplicables para el tipo de Suscripción que ha seleccionado.</p>
        <p>En cualquier momento y sin previo aviso, la Compañía se reserva el derecho de (i) modificar los términos y condiciones de la oferta de Prueba Gratuita, o (ii) cancelar dicha oferta de Prueba Gratuita.</p>

        <h3>Capacidad de almacenamiento y limitaciones de uso</h3>
        <p>Cada plan de Suscripción tiene una capacidad de almacenamiento diferente, basada en el número total de fotos almacenadas.</p>
        <p>Los planes de Suscripción no fueron diseñados para usar la Aplicación como una simple cámara, eliminando fotos inmediatamente después de ser compartidas, sin que el historial de fotos sea almacenado. Este tipo de uso termina sobrecargando los recursos de la Aplicación. La Compañía se reserva el derecho de limitar el número de fotos eliminadas para prevenir el abuso.</p>

        <h2>Contáctenos</h2>
        <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos:</p>
        <ul>
            <li>Por correo electrónico: info@photodoc.app</li>
        </ul>
    </>
);

export default TermsAndConditions;
