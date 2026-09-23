import type { PrivacyContent } from "@/lib/privacy";
import type { TermsContent } from "@/lib/terms";

type LegalContent = {
  privacy: PrivacyContent;
  terms: TermsContent;
};

export const legalWestern = {
  es: {
    privacy: {
      navLabel: "Privacidad",
      title: "Política de privacidad",
      subtitle:
        "Cómo trata este sitio los datos personales, en particular las direcciones IP.",
      lastUpdatedLabel: "Última actualización",
      lastUpdated: "2026-09-02",
      contactNotConfigured: "dirección de contacto disponible a petición",
      controllerNotConfigured:
        "el operador de este sitio (identidad disponible a petición)",
      sections: [
        {
          heading: "1. Responsable del tratamiento",
          paragraphs: [
            "Este sitio es un proyecto personal y no comercial. El responsable del tratamiento en el sentido del Reglamento General de Protección de Datos (RGPD) es {controller}.",
            "Contacto para cuestiones de protección de datos: {email}",
          ],
        },
        {
          heading: "2. Minimización de datos",
          paragraphs: [
            "Este sitio no utiliza cookies de seguimiento, herramientas de análisis web, redes publicitarias ni cuentas de usuario. No crea perfiles de seguimiento, publicitarios o persistentes, ni trata datos personales con fines de marketing.",
            "Sin embargo, al mostrar su propia dirección IP, el sitio obtiene atributos de red de esa dirección en tiempo real, como la ubicación aproximada, el proveedor/ASN, el tipo de conexión y una evaluación de proxy/hosting. Estos datos sirven únicamente para mostrar el resultado inmediatamente y no se almacenan de forma permanente ni se combinan para formar un perfil personal.",
          ],
        },
        {
          heading: "3. Datos de acceso y dirección IP",
          paragraphs: [
            "Al acceder al sitio, el servidor trata datos de acceso técnicamente necesarios, incluido su dirección IP. Esta se utiliza para entregar el sitio y, durante un breve periodo, para evitar abuso y saturación (rate limiting).",
            "El rate limiting solo mantiene contadores volátiles en memoria (una ventana de aproximadamente 60 segundos). La aplicación no crea por sí misma una base de datos de registros permanente con direcciones IP.",
            "La base jurídica es el interés legítimo en garantizar el funcionamiento seguro y estable del sitio, conforme al art. 6.1.f del RGPD. Con independencia de ello, el proveedor de alojamiento puede mantener sus propios registros del servidor.",
          ],
        },
        {
          heading: "4. Tratamiento al utilizar las herramientas",
          paragraphs: [
            "La función principal de este sitio es consultar información sobre direcciones IP, dominios y redes. Cuando consulta su propia IP o comprueba una dirección IP o un dominio, estos datos se envían a servicios externos públicos para obtener la información solicitada.",
            "Algunas herramientas tratan más que una dirección IP o un dominio: la comprobación de CDN solicita al destino la URL completa que introduce, incluida su ruta y sus parámetros de consulta. Las comprobaciones de alcance (ping/database) pueden transmitir al destino que indique las credenciales que introduzca, como un nombre de usuario y una contraseña, como parte del establecimiento de la conexión. Dichos datos solo se utilizan para la comprobación correspondiente, no se almacenan de forma permanente y no se comparten con terceros fuera del destino que usted indique.",
            "La base jurídica es el art. 6.1.f del RGPD (prestación de la función que usted ha solicitado activamente).",
          ],
        },
        {
          heading: "5. Servicios externos integrados",
          paragraphs: [
            "Según la herramienta utilizada, se realizan solicitudes a los siguientes servicios. Algunos de estos servicios están situados fuera de la UE/EEE, en particular en Estados Unidos. Cualquier transferencia a un tercer país se realiza con arreglo a las condiciones del proveedor en materia de protección de datos y transferencias; para algunos proveedores puede no existir una decisión de adecuación y pueden faltar salvaguardas adecuadas conforme al art. 46 del RGPD. Puede solicitar más información sobre la base de transferencia de un servicio concreto a través de la dirección de contacto indicada.",
          ],
          bullets: [
            "ip-api.com: geolocalización de IP y metadatos de red (en el servidor).",
            "ipinfo.io: detalles opcionales del ASN si se ha configurado un token (en el servidor).",
            "stat.ripe.net (RIPE NCC, UE): datos públicos de enrutamiento y ASN (en el servidor).",
            "peeringdb.com: perfiles públicos de redes y peering (en el servidor).",
            "WHOIS/RDAP: en las consultas WHOIS, el destino introducido se envía primero a whois.iana.org y después al servidor WHOIS del registro correspondiente o de derivación; rdap.org actúa como fuente RDAP/de reserva (en el servidor).",
            "Listas de bloqueo de DNS: zen.spamhaus.org (incluidas SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org y bl.blocklist.de; en las comprobaciones de reputación, la IP consultada se transmite desde el servidor mediante consultas DNS.",
            "api.blocklist.de: además, el número de ataques comunicados para la IP consultada (en el servidor, sin clave de API).",
            "Feodo Tracker (feodotracker.abuse.ch) y Spamhaus DROP (drop/dropv6): conjuntos de datos de C2 de botnets y de bloques de red declarados criminales; estas fuentes se descargan y almacenan en caché en el servidor a intervalos regulares. La IP consultada no se transmite a abuse.ch ni a Spamhaus en estas comprobaciones basadas en fuentes.",
            "api.greynoise.io (Community API): contexto sobre escáneres de internet; sin autenticación o con una clave gratuita opcional; los resultados se almacenan en caché en el servidor durante 24 horas por IP.",
            "api.abuseipdb.com: datos opcionales de reputación o abuso si se ha configurado una clave (en el servidor).",
            "dnsbl.httpbl.org (Project Honey Pot): datos opcionales de abuso web (harvesters, spammers de comentarios) si se ha configurado una clave de acceso (en el servidor).",
            "threatfox-api.abuse.ch: consulta opcional de indicadores de amenazas (IOC) si se ha configurado una Auth-Key (en el servidor).",
            "flagcdn.com: banderas de países. Si un resultado incluye un país, el código de país correspondiente se reenvía desde el servidor, mediante un proxy propio, a flagcdn.com (durante el proceso no se comparte su dirección IP); la imagen de la bandera se almacena en caché en el servidor.",
            "Resolutor DNS recursivo: para las comprobaciones basadas en dominios, el nombre de host introducido se resuelve mediante el resolutor DNS configurado por el alojamiento o el sistema; dicho resolutor, posiblemente gestionado por el proveedor de alojamiento, recibe el nombre de host consultado.",
            "api64.ipify.org y checkip.amazonaws.com: determinan su propia dirección IP directamente desde su navegador; su dirección IP se envía directamente a estos servicios.",
          ],
        },
        {
          heading: "6. Almacenamiento local (tema)",
          paragraphs: [
            "Su preferencia de tema (claro/oscuro/sistema) se guarda como un valor en el almacenamiento local (localStorage) de su navegador. Esto es técnicamente funcional, solo sirve para su preferencia y no transmite datos al servidor ni a terceros. No requiere consentimiento.",
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "Este sitio no establece cookies de consentimiento, seguimiento o publicidad, ni utiliza técnicas comparables para reconocerle entre distintos dispositivos. Solo se realiza el almacenamiento técnicamente necesario de su preferencia de tema descrito en «Almacenamiento local (tema)», en el almacenamiento local de su navegador.",
            "Como no se utilizan cookies ni rastreadores que exijan consentimiento, este sitio no necesita un aviso de cookies.",
          ],
        },
        {
          heading: "8. Seguridad de los datos",
          paragraphs: [
            "El sitio se sirve mediante HTTPS (TLS) cifrado para proteger la transmisión frente al acceso no autorizado y la manipulación. Además, dentro de las posibilidades de este proyecto personal se adoptan medidas técnicas y organizativas adecuadas para proteger los datos tratados frente a la pérdida, el abuso y el acceso no autorizado.",
            "Sin embargo, conforme al estado actual de la técnica, no puede garantizarse una protección completa durante la transmisión por internet.",
          ],
        },
        {
          heading: "9. Cómo ponerse en contacto con nosotros",
          paragraphs: [
            "Si se pone en contacto con nosotros mediante la dirección indicada, tratamos la información que nos comunique (como su dirección de correo electrónico y el contenido del mensaje) únicamente para gestionar su solicitud. La base jurídica es nuestro interés legítimo en responder a las consultas conforme al art. 6.1.f del RGPD.",
            "La información se elimina cuando deja de ser necesaria para gestionar la solicitud y no existen obligaciones legales de conservación.",
          ],
        },
        {
          heading: "10. Conservación",
          paragraphs: [
            "La aplicación no almacena de forma permanente los datos de las solicitudes. Los contadores del rate limiting caducan una vez transcurrido su periodo de vigencia (aproximadamente 60 segundos); la entrada correspondiente se elimina físicamente de la memoria durante una limpieza posterior promovida por nuevas solicitudes. Si no llega más tráfico, una entrada ya caducada puede permanecer en memoria hasta la siguiente limpieza o hasta que se reinicie el proceso. No se realiza ningún almacenamiento permanente ni evaluable a efectos personales.",
            "Los datos enviados a servicios externos están sujetos a las respectivas políticas de privacidad de esos proveedores.",
          ],
        },
        {
          heading: "11. No se adoptan decisiones automatizadas",
          paragraphs: [
            "No se adoptan decisiones exclusivamente automatizadas, incluida la generación de perfiles, en el sentido del art. 22 del RGPD. Las evaluaciones mostradas por las herramientas, como las relativas al tipo de conexión o al uso de proxy/hosting, sirven únicamente para informar directamente al usuario y no producen efectos jurídicos respecto a él.",
          ],
        },
        {
          heading: "12. Sus derechos",
          paragraphs: [
            "Sujeto a los requisitos legales, tiene derecho a acceder a sus datos, rectificarlos, suprimirlos, limitar su tratamiento, obtener su portabilidad y oponerse al tratamiento basado en intereses legítimos.",
            "Dado que el tratamiento se basa en intereses legítimos, también tiene derecho a oponerse en cualquier momento a dicho tratamiento por motivos relacionados con su situación particular (art. 21 del RGPD).",
            "Además, tiene derecho a presentar una reclamación ante una autoridad de control de protección de datos. Para cualquier solicitud, puede ponerse en contacto con nosotros en: {email}",
          ],
        },
        {
          heading: "13. Cambios en esta política",
          paragraphs: [
            "Esta política de privacidad se actualiza cuando resulta necesario, por ejemplo, cuando cambian las funciones o los servicios integrados. Se aplicará en cada caso la versión publicada aquí.",
          ],
        },
      ],
    } satisfies PrivacyContent,
    terms: {
      navLabel: "Condiciones de uso",
      title: "Condiciones de uso",
      subtitle:
        "Las condiciones que regulan el uso de las herramientas ofrecidas en este sitio.",
      lastUpdatedLabel: "Última actualización",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "dirección de contacto disponible a petición",
      sections: [
        {
          heading: "1. Ámbito de aplicación",
          paragraphs: [
            "Estas condiciones de uso se aplican al uso de este sitio y de las herramientas ofrecidas aquí para consultar información sobre IP, dominios y redes. Al utilizar el sitio, acepta estas condiciones.",
            "Este sitio es un proyecto personal y no comercial que se ofrece sin contraprestación. Si no acepta estas condiciones, le pedimos que no utilice el sitio.",
          ],
        },
        {
          heading: "2. Descripción del servicio",
          paragraphs: [
            "El sitio ofrece herramientas para consultar información públicamente disponible sobre direcciones IP, dominios y redes. Parte de los resultados proceden de servicios externos públicos y se reproducen sin garantía alguna de exactitud, integridad o actualización.",
            "Las herramientas están destinadas a usuarios con interés técnico y no sustituyen el asesoramiento profesional en materia de redes, seguridad o derecho.",
          ],
        },
        {
          heading: "3. Disponibilidad del servicio",
          paragraphs: [
            "No existe derecho a una disponibilidad determinada o ininterrumpida del sitio. El servicio puede mantenerse, limitarse, modificarse o suspenderse definitivamente en cualquier momento y sin previo aviso.",
            "Para evitar abuso y saturación, pueden limitarse o rechazarse solicitudes individuales mediante rate limiting.",
          ],
        },
        {
          heading: "4. Uso aceptable",
          paragraphs: [
            "Se compromete a utilizar el sitio únicamente de conformidad con la legislación aplicable. En particular, queda prohibido:",
          ],
          bullets: [
            "realizar consultas automatizadas o masivas a una escala que perjudique el funcionamiento o eluda los límites de solicitudes;",
            "utilizar las herramientas para preparar o llevar a cabo ataques, accesos no autorizados u otras conductas ilícitas;",
            "introducir destinos o credenciales para cuya comprobación no esté autorizado;",
            "eludir las restricciones técnicas o las medidas de seguridad del sitio;",
            "cualquier uso que vulnere derechos de terceros o contravenga la legislación aplicable.",
          ],
        },
        {
          heading: "5. Sin garantía sobre los resultados",
          paragraphs: [
            "La información obtenida se proporciona exclusivamente con fines técnicos e informativos. Puede estar incompleta, obsoleta o ser incorrecta y no sustituye el asesoramiento profesional, jurídico o de seguridad.",
            "La evaluación y el uso de los resultados son responsabilidad suya. No se acepta responsabilidad alguna por las decisiones que tome basándose en la información mostrada.",
          ],
        },
        {
          heading: "6. Servicios y contenidos externos",
          paragraphs: [
            "Para ofrecer los resultados, se envían solicitudes a servicios externos. El proveedor correspondiente es responsable de sus contenidos, disponibilidad y tratamiento de datos. Los detalles de los servicios integrados se encuentran en la política de privacidad.",
          ],
        },
        {
          heading: "7. Responsabilidad",
          paragraphs: [
            "Las herramientas se proporcionan «tal cual», sin garantía alguna. En la medida en que lo permita la legislación, queda excluida la responsabilidad por los daños derivados del uso o la indisponibilidad del sitio, o de la confianza en los resultados mostrados.",
            "Esto no afecta a la responsabilidad por dolo o culpa grave, ni a la responsabilidad por daños derivados de lesiones a la vida, el cuerpo o la salud.",
          ],
        },
        {
          heading: "8. Responsabilidad por enlaces",
          paragraphs: [
            "El sitio puede contener referencias a sitios web externos de terceros o mostrar resultados que apunten a ellos. No influimos en su contenido y no asumimos responsabilidad por él. El proveedor correspondiente es siempre responsable del contenido de las páginas vinculadas.",
          ],
        },
        {
          heading: "9. Propiedad intelectual",
          paragraphs: [
            "El diseño del sitio y el código fuente subyacente están protegidos por derechos de propiedad intelectual o se rigen por la licencia correspondiente del proyecto. Los datos mostrados mediante las herramientas proceden en su mayoría de fuentes públicas de terceros y pueden estar sujetos a sus condiciones de uso.",
          ],
        },
        {
          heading: "10. Protección de datos",
          paragraphs: [
            "Puede encontrar información sobre el tratamiento de datos personales en la política de privacidad. Al utilizar el sitio, toma conocimiento del tratamiento de datos descrito en ella.",
          ],
        },
        {
          heading: "11. Disposiciones finales",
          paragraphs: [
            "Si alguna de estas condiciones de uso fuera o llegara a ser inválida, la validez de las demás condiciones no se vería afectada.",
            "Se aplica la ley del lugar de establecimiento del responsable, salvo que normas legales imperativas —por ejemplo, en favor de los consumidores— lo excluyan.",
          ],
        },
        {
          heading: "12. Cambios en estas condiciones",
          paragraphs: [
            "Estas condiciones de uso podrán modificarse cuando sea necesario, por ejemplo, cuando cambien las funciones o los servicios integrados. Se aplicará en cada caso la versión publicada aquí.",
            "Para cualquier cuestión, puede ponerse en contacto con nosotros en: {email}",
          ],
        },
      ],
    } satisfies TermsContent,
  },
  fr: {
    privacy: {
      navLabel: "Confidentialité",
      title: "Politique de confidentialité",
      subtitle:
        "Comment ce site traite les données à caractère personnel, notamment les adresses IP.",
      lastUpdatedLabel: "Dernière mise à jour",
      lastUpdated: "2026-09-02",
      contactNotConfigured: "adresse de contact communiquée sur demande",
      controllerNotConfigured:
        "l’exploitant de ce site (identité communiquée sur demande)",
      sections: [
        {
          heading: "1. Responsable du traitement",
          paragraphs: [
            "Ce site est un projet personnel et non commercial. Le responsable du traitement au sens du Règlement général sur la protection des données (RGPD) est {controller}.",
            "Contact pour toute question relative à la protection des données : {email}",
          ],
        },
        {
          heading: "2. Minimisation des données",
          paragraphs: [
            "Ce site n’utilise aucun cookie de suivi, outil d’analyse web, réseau publicitaire ni compte utilisateur. Aucun profil de suivi, publicitaire ou persistant n’est créé, et aucune donnée personnelle n’est traitée à des fins marketing.",
            "Toutefois, lorsque votre propre adresse IP est affichée, des attributs réseau sont déduits de cette adresse en temps réel, tels que la localisation approximative, le fournisseur/ASN, le type de connexion et une évaluation proxy/hébergement. Ils servent uniquement à afficher immédiatement le résultat et ne sont ni conservés durablement ni regroupés pour former un profil personnel.",
          ],
        },
        {
          heading: "3. Données d’accès et adresse IP",
          paragraphs: [
            "Lorsque vous ouvrez le site, le serveur traite les données d’accès techniquement nécessaires, notamment votre adresse IP. Elle sert à fournir le site et, brièvement, à prévenir les abus et les surcharges (rate limiting).",
            "Le rate limiting conserve uniquement des compteurs volatils en mémoire (une fenêtre d’environ 60 secondes). L’application ne constitue pas elle-même de base de données de journaux permanente contenant des adresses IP.",
            "La base légale est l’intérêt légitime à assurer un fonctionnement sécurisé et stable du site, conformément à l’art. 6.1.f du RGPD. Indépendamment de cela, le fournisseur d’hébergement peut conserver ses propres journaux de serveur.",
          ],
        },
        {
          heading: "4. Traitement lors de l’utilisation des outils",
          paragraphs: [
            "La fonction principale de ce site est de consulter des informations sur les adresses IP, les domaines et les réseaux. Lorsque vous affichez votre propre IP ou vérifiez une adresse IP ou un domaine, cette adresse ou ce domaine est transmis à des services externes publics afin d’obtenir les informations demandées.",
            "Certains outils traitent davantage qu’une adresse IP ou qu’un domaine : la vérification CDN demande à la cible l’URL complète que vous saisissez, y compris son chemin et ses paramètres de requête. Les tests d’atteinte (ping/database) peuvent transmettre à la cible que vous indiquez les identifiants que vous saisissez, tels qu’un nom d’utilisateur et un mot de passe, dans le cadre de l’établissement de la connexion. Ces données servent uniquement au test concerné, ne sont pas conservées durablement et ne sont pas communiquées à des tiers au-delà de la cible que vous indiquez.",
            "La base légale est l’art. 6.1.f du RGPD (fourniture de la fonction que vous avez activement demandée).",
          ],
        },
        {
          heading: "5. Services externes intégrés",
          paragraphs: [
            "Selon l’outil utilisé, des requêtes sont adressées aux services suivants. Certains de ces services sont établis hors de l’UE/EEE, en particulier aux États-Unis. Toute transmission vers un pays tiers est effectuée sur la base des conditions du fournisseur en matière de protection des données et de transferts ; pour certains fournisseurs, il peut ne pas exister de décision d’adéquation et des garanties appropriées au sens de l’art. 46 du RGPD peuvent faire défaut. Vous pouvez demander des précisions sur la base du transfert pour un service donné à l’adresse de contact ci-dessous.",
          ],
          bullets: [
            "ip-api.com : géolocalisation d’IP et métadonnées réseau (côté serveur).",
            "ipinfo.io : détails ASN facultatifs si un token est configuré (côté serveur).",
            "stat.ripe.net (RIPE NCC, UE) : données publiques de routage et d’ASN (côté serveur).",
            "peeringdb.com : profils publics de réseaux et de peering (côté serveur).",
            "WHOIS/RDAP : pour les recherches WHOIS, la cible saisie est d’abord transmise à whois.iana.org, puis au serveur WHOIS du registre ou de référencement compétent ; rdap.org sert de source RDAP/de secours (côté serveur).",
            "Listes de blocage DNS : zen.spamhaus.org (dont SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org et bl.blocklist.de ; pour les contrôles de réputation, l’IP interrogée est transmise côté serveur au moyen de requêtes DNS.",
            "api.blocklist.de : en outre, le nombre d’attaques signalées concernant l’IP interrogée (côté serveur, sans clé d’API).",
            "Feodo Tracker (feodotracker.abuse.ch) et Spamhaus DROP (drop/dropv6) : jeux de données C2 de botnets et de blocs réseau classés comme criminels ; ces flux sont téléchargés et mis en cache côté serveur à intervalles réguliers. L’IP interrogée n’est pas transmise à abuse.ch ou à Spamhaus pour ces contrôles fondés sur ces flux.",
            "api.greynoise.io (Community API) : contexte relatif aux scanners sur tout Internet ; sans authentification ou avec une clé gratuite facultative ; les résultats sont mis en cache côté serveur pendant 24 heures par IP.",
            "api.abuseipdb.com : données facultatives de réputation ou d’abus si une clé est configurée (côté serveur).",
            "dnsbl.httpbl.org (Project Honey Pot) : données facultatives d’abus web (harvesters, spammeurs de commentaires) si une clé d’accès est configurée (côté serveur).",
            "threatfox-api.abuse.ch : recherche facultative d’indicateurs de menace (IOC) si une Auth-Key est configurée (côté serveur).",
            "flagcdn.com : drapeaux de pays. Lorsqu’un résultat comprend un pays, le code de pays correspondant est transmis côté serveur, via un proxy appartenant au site, à flagcdn.com (votre adresse IP n’est pas communiquée pendant ce processus) ; l’image du drapeau est mise en cache côté serveur.",
            "Résolveur DNS récursif : pour les vérifications fondées sur un domaine, le nom d’hôte saisi est résolu au moyen du résolveur DNS configuré par l’hébergement ou le système ; ce résolveur, éventuellement géré par le fournisseur d’hébergement, reçoit le nom d’hôte interrogé.",
            "api64.ipify.org et checkip.amazonaws.com : détermination de votre propre adresse IP directement depuis votre navigateur ; votre adresse IP est transmise directement à ces services.",
          ],
        },
        {
          heading: "6. Stockage local (thème)",
          paragraphs: [
            "Votre préférence de thème (clair/sombre/système) est enregistrée sous forme de valeur dans le stockage local (localStorage) de votre navigateur. Cette opération est techniquement fonctionnelle, sert uniquement à conserver votre préférence et ne transmet aucune donnée au serveur ni à des tiers. Aucun consentement n’est requis.",
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "Ce site ne dépose aucun cookie de consentement, de suivi ou publicitaire et n’utilise aucune technique comparable pour vous reconnaître entre plusieurs appareils. Seul le stockage techniquement nécessaire de votre préférence de thème décrit sous « Stockage local (thème) » a lieu, dans le stockage local de votre navigateur.",
            "Comme aucun cookie ni traceur soumis à consentement n’est utilisé, ce site n’a pas besoin d’un bandeau de consentement aux cookies.",
          ],
        },
        {
          heading: "8. Sécurité des données",
          paragraphs: [
            "Le site est servi via HTTPS (TLS) chiffré afin de protéger la transmission contre toute consultation ou modification non autorisée. Au-delà de cette mesure, des mesures techniques et organisationnelles appropriées sont prises, dans les moyens de ce projet personnel, pour protéger les données traitées contre la perte, l’abus et l’accès non autorisé.",
            "Toutefois, selon l’état de l’art, une protection complète pendant la transmission sur Internet ne peut être garantie.",
          ],
        },
        {
          heading: "9. Prise de contact",
          paragraphs: [
            "Si vous nous contactez à l’adresse indiquée, nous traitons les informations que vous nous communiquez (telles que votre adresse e-mail et le contenu de votre message) uniquement pour traiter votre demande. La base légale est notre intérêt légitime à répondre aux demandes conformément à l’art. 6.1.f du RGPD.",
            "Les informations sont supprimées dès qu’elles ne sont plus nécessaires au traitement de la demande et qu’aucune obligation légale de conservation ne s’y oppose.",
          ],
        },
        {
          heading: "10. Conservation",
          paragraphs: [
            "L’application ne conserve pas durablement les données des demandes. Les compteurs du rate limiting expirent à l’expiration de leur fenêtre de temps (environ 60 secondes) ; l’entrée correspondante est physiquement retirée de la mémoire lors d’un nettoyage ultérieur déclenché par de nouvelles requêtes. En l’absence de trafic supplémentaire, une entrée déjà expirée peut rester en mémoire jusqu’au nettoyage suivant ou jusqu’au redémarrage du processus. Aucune conservation durable ou évaluable à titre personnel n’est effectuée.",
            "Les données transmises à des services externes sont soumises aux politiques de confidentialité respectives de ces fournisseurs.",
          ],
        },
        {
          heading: "11. Aucune décision automatisée",
          paragraphs: [
            "Aucune décision exclusivement automatisée, y compris le profilage, au sens de l’art. 22 du RGPD, n’est prise. Les évaluations affichées par les outils, par exemple concernant le type de connexion ou l’utilisation d’un proxy/de l’hébergement, servent uniquement à vous informer directement et n’ont pas d’effet juridique à votre égard.",
          ],
        },
        {
          heading: "12. Vos droits",
          paragraphs: [
            "Sous réserve des conditions prévues par la loi, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation du traitement et à la portabilité de vos données, ainsi que du droit de vous opposer à un traitement fondé sur des intérêts légitimes.",
            "Puisque le traitement repose sur des intérêts légitimes, vous avez également le droit de vous y opposer à tout moment pour des motifs tenant à votre situation particulière (art. 21 du RGPD).",
            "Vous avez en outre le droit d’introduire une réclamation auprès d’une autorité de contrôle de la protection des données. Pour toute demande, vous pouvez nous joindre à l’adresse suivante : {email}",
          ],
        },
        {
          heading: "13. Modifications de cette politique",
          paragraphs: [
            "Cette politique de confidentialité est mise à jour lorsque cela est nécessaire, par exemple lorsque les fonctionnalités ou les services intégrés changent. La version publiée ici s’applique dans tous les cas.",
          ],
        },
      ],
    } satisfies PrivacyContent,
    terms: {
      navLabel: "Conditions d’utilisation",
      title: "Conditions d’utilisation",
      subtitle:
        "Les conditions qui régissent votre utilisation des outils proposés sur ce site.",
      lastUpdatedLabel: "Dernière mise à jour",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "adresse de contact communiquée sur demande",
      sections: [
        {
          heading: "1. Champ d’application",
          paragraphs: [
            "Ces conditions d’utilisation s’appliquent à votre utilisation de ce site et des outils qui y sont proposés pour consulter des informations sur les IP, les domaines et les réseaux. En utilisant le site, vous acceptez ces conditions.",
            "Ce site est un projet personnel et non commercial fourni gratuitement. Si vous n’acceptez pas ces conditions, nous vous demandons de ne pas utiliser le site.",
          ],
        },
        {
          heading: "2. Description du service",
          paragraphs: [
            "Le site propose des outils permettant de consulter des informations publiquement disponibles sur les adresses IP, les domaines et les réseaux. Certains résultats proviennent de services externes publics et sont reproduits sans aucune garantie d’exactitude, d’exhaustivité ou d’actualité.",
            "Les outils sont destinés à un usage par des personnes intéressées par la technique et ne remplacent pas un conseil professionnel en matière de réseau, de sécurité ou de droit.",
          ],
        },
        {
          heading: "3. Disponibilité du service",
          paragraphs: [
            "Aucun droit à une disponibilité déterminée ou ininterrompue du site n’est accordé. Le service peut être maintenu, limité, modifié ou arrêté définitivement à tout moment sans préavis.",
            "Pour prévenir les abus et les surcharges, des requêtes individuelles peuvent être limitées ou refusées au moyen du rate limiting.",
          ],
        },
        {
          heading: "4. Utilisation acceptable",
          paragraphs: [
            "Vous vous engagez à n’utiliser le site que conformément au droit applicable. En particulier, sont interdits :",
          ],
          bullets: [
            "les requêtes automatisées ou massives à une échelle qui perturbe le fonctionnement ou permet de contourner les limites de requêtes ;",
            "l’utilisation des outils pour préparer ou exécuter des attaques, des accès non autorisés ou d’autres actes illicites ;",
            "la saisie de cibles ou d’identifiants pour lesquels vous n’êtes pas autorisé à effectuer le test ;",
            "le contournement des restrictions techniques ou des mesures de sécurité du site ;",
            "toute utilisation qui porte atteinte aux droits de tiers ou enfreint le droit applicable.",
          ],
        },
        {
          heading: "5. Absence de garantie sur les résultats",
          paragraphs: [
            "Les informations récupérées sont fournies uniquement à des fins techniques et informatives. Elles peuvent être incomplètes, obsolètes ou incorrectes et ne remplacent pas un conseil professionnel, juridique ou de sécurité.",
            "L’évaluation et l’utilisation des résultats relèvent de votre seule responsabilité. Aucune responsabilité n’est acceptée pour les décisions que vous prenez sur la base des informations affichées.",
          ],
        },
        {
          heading: "6. Services et contenus externes",
          paragraphs: [
            "Afin de fournir les résultats, des requêtes sont transmises à des services externes. Le fournisseur concerné est responsable de leur contenu, de leur disponibilité et du traitement des données. Les détails des services intégrés figurent dans la politique de confidentialité.",
          ],
        },
        {
          heading: "7. Responsabilité",
          paragraphs: [
            "Les outils sont fournis « en l’état », sans aucune garantie. Dans la limite permise par la loi, la responsabilité des dommages résultant de l’utilisation ou de l’indisponibilité du site, ou de la confiance accordée aux résultats affichés, est exclue.",
            "Cela n’affecte pas la responsabilité pour intention ou faute lourde, ni la responsabilité des dommages résultant d’atteintes à la vie, au corps ou à la santé.",
          ],
        },
        {
          heading: "8. Responsabilité concernant les liens",
          paragraphs: [
            "Le site peut contenir des renvois vers des sites web externes de tiers ou afficher des résultats qui y renvoient. Nous n’avons aucune influence sur leur contenu et n’en assumons aucune responsabilité. Le fournisseur concerné reste toujours responsable du contenu des pages liées.",
          ],
        },
        {
          heading: "9. Propriété intellectuelle",
          paragraphs: [
            "La conception du site et le code source sous-jacent sont protégés par des droits de propriété intellectuelle ou régis par la licence applicable du projet. Les données affichées par les outils proviennent principalement de sources publiques de tiers et peuvent être soumises à leurs conditions d’utilisation.",
          ],
        },
        {
          heading: "10. Protection des données",
          paragraphs: [
            "Les informations relatives au traitement des données à caractère personnel figurent dans la politique de confidentialité. En utilisant le site, vous prenez connaissance du traitement des données qui y est décrit.",
          ],
        },
        {
          heading: "11. Dispositions finales",
          paragraphs: [
            "Si une quelconque disposition de ces conditions d’utilisation est ou devient invalide, la validité des autres dispositions n’en est pas affectée.",
            "Le droit du lieu d’établissement du responsable s’applique, sauf si des dispositions légales impératives — par exemple en faveur des consommateurs — y font obstacle.",
          ],
        },
        {
          heading: "12. Modifications de ces conditions",
          paragraphs: [
            "Ces conditions d’utilisation peuvent être ajustées lorsque cela est nécessaire, par exemple lorsque les fonctionnalités ou les services intégrés changent. La version publiée ici s’applique dans tous les cas.",
            "Pour toute question, vous pouvez nous joindre à l’adresse suivante : {email}",
          ],
        },
      ],
    } satisfies TermsContent,
  },
  it: {
    privacy: {
      navLabel: "Privacy",
      title: "Informativa sulla privacy",
      subtitle:
        "Come questo sito tratta i dati personali, in particolare gli indirizzi IP.",
      lastUpdatedLabel: "Ultimo aggiornamento",
      lastUpdated: "2026-09-02",
      contactNotConfigured: "indirizzo di contatto disponibile su richiesta",
      controllerNotConfigured:
        "il gestore di questo sito (identità disponibile su richiesta)",
      sections: [
        {
          heading: "1. Titolare del trattamento",
          paragraphs: [
            "Questo sito è un progetto personale e non commerciale. Il titolare del trattamento ai sensi del Regolamento generale sulla protezione dei dati (GDPR) è {controller}.",
            "Contatto per questioni relative alla protezione dei dati: {email}",
          ],
        },
        {
          heading: "2. Minimizzazione dei dati",
          paragraphs: [
            "Questo sito non utilizza cookie di tracciamento, strumenti di analisi web, reti pubblicitarie né account utente. Non vengono creati profili di tracciamento, pubblicitari o persistenti e non vengono trattati dati personali per finalità di marketing.",
            "Tuttavia, quando viene visualizzato il proprio indirizzo IP, gli attributi di rete vengono dedotti da tale indirizzo in tempo reale, ad esempio la posizione approssimativa, il provider/ASN, il tipo di connessione e una valutazione proxy/hosting. Tali dati servono soltanto a mostrare immediatamente il risultato e non vengono conservati in modo permanente né aggregati per formare un profilo personale.",
          ],
        },
        {
          heading: "3. Dati di accesso e indirizzo IP",
          paragraphs: [
            "Quando si accede al sito, il server tratta dati di accesso tecnicamente necessari, tra cui l’indirizzo IP. Questo viene utilizzato per fornire il sito e, per un breve periodo, per prevenire abusi e sovraccarichi (rate limiting).",
            "Il rate limiting mantiene soltanto contatori volatili in memoria (una finestra di circa 60 secondi). L’applicazione non crea autonomamente un database di log permanente contenente indirizzi IP.",
            "La base giuridica è l’interesse legittimo a garantire un funzionamento sicuro e stabile del sito, ai sensi dell’art. 6.1.f del GDPR. Indipendentemente da ciò, il provider di hosting può mantenere propri log del server.",
          ],
        },
        {
          heading: "4. Trattamento durante l’utilizzo degli strumenti",
          paragraphs: [
            "La funzione principale di questo sito è consultare informazioni su indirizzi IP, domini e reti. Quando visualizzate il vostro IP o verificate un indirizzo IP o un dominio, tale indirizzo o dominio viene trasmesso a servizi esterni pubblici per ottenere le informazioni richieste.",
            "Alcuni strumenti trattano più di un indirizzo IP o dominio: il controllo CDN richiede al bersaglio l’URL completo inserito, compreso il percorso e i parametri di query. I controlli di raggiungibilità (ping/database) possono trasmettere al bersaglio indicato le credenziali inserite, come nome utente e password, nell’ambito della connessione. Tali dati vengono utilizzati soltanto per il controllo corrispondente, non sono conservati in modo permanente e non vengono condivisi con terzi al di fuori del bersaglio indicato.",
            "La base giuridica è l’art. 6.1.f del GDPR (erogazione della funzione richiesta attivamente dall’utente).",
          ],
        },
        {
          heading: "5. Servizi esterni integrati",
          paragraphs: [
            "A seconda dello strumento utilizzato, le richieste vengono inviate ai seguenti servizi. Alcuni di tali servizi sono situati al di fuori dell’UE/SEE, in particolare negli Stati Uniti. Qualsiasi trasferimento verso un paese terzo avviene sulla base delle condizioni del provider in materia di protezione dei dati e trasferimenti; per alcuni provider potrebbe non esistere una decisione di adeguatezza e potrebbero mancare garanzie appropriate ai sensi dell’art. 46 del GDPR. È possibile richiedere maggiori informazioni sulla base del trasferimento di un servizio specifico tramite l’indirizzo di contatto indicato.",
          ],
          bullets: [
            "ip-api.com: geolocalizzazione IP e metadati di rete (lato server).",
            "ipinfo.io: dettagli ASN facoltativi se è configurato un token (lato server).",
            "stat.ripe.net (RIPE NCC, UE): dati pubblici di instradamento e ASN (lato server).",
            "peeringdb.com: profili pubblici di reti e peering (lato server).",
            "WHOIS/RDAP: per le ricerche WHOIS, il bersaglio inserito viene prima trasmesso a whois.iana.org e poi al server WHOIS del registro o di referral competente; rdap.org funge da fonte RDAP/di riserva (lato server).",
            "Liste di blocco DNS: zen.spamhaus.org (incluse SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org e bl.blocklist.de; per i controlli di reputazione, l’IP interrogato viene trasmesso lato server tramite query DNS.",
            "api.blocklist.de: inoltre, il numero di attacchi segnalati per l’IP interrogato (lato server, senza chiave API).",
            "Feodo Tracker (feodotracker.abuse.ch) e Spamhaus DROP (drop/dropv6): dataset C2 di botnet e di blocchi di rete classificati come criminali; questi feed vengono scaricati e memorizzati nella cache lato server a intervalli regolari. L’IP interrogato non viene trasmesso ad abuse.ch o a Spamhaus per questi controlli basati sui feed.",
            "api.greynoise.io (Community API): contesto relativo agli scanner su scala Internet; senza autenticazione o con una chiave gratuita facoltativa; i risultati vengono memorizzati nella cache lato server per 24 ore per IP.",
            "api.abuseipdb.com: dati facoltativi di reputazione o abuso se è configurata una chiave (lato server).",
            "dnsbl.httpbl.org (Project Honey Pot): dati facoltativi sugli abusi web (harvesters, spammer dei commenti) se è configurata una chiave di accesso (lato server).",
            "threatfox-api.abuse.ch: ricerca facoltativa di indicatori di minaccia (IOC) se è configurata una Auth-Key (lato server).",
            "flagcdn.com: bandiere nazionali. Se un risultato include un Paese, il relativo codice viene inoltrato lato server, tramite un proxy di proprietà, a flagcdn.com (il vostro indirizzo IP non viene condiviso durante il processo); l’immagine della bandiera viene memorizzata nella cache lato server.",
            "Resolver DNS ricorsivo: per i controlli basati su dominii, l’hostname inserito viene risolto tramite il resolver DNS configurato dall’hosting o dal sistema; tale resolver, eventualmente gestito dal provider di hosting, riceve l’hostname interrogato.",
            "api64.ipify.org e checkip.amazonaws.com: determinano il vostro indirizzo IP direttamente dal browser; il vostro indirizzo IP viene inviato direttamente a questi servizi.",
          ],
        },
        {
          heading: "6. Archiviazione locale (tema)",
          paragraphs: [
            "La preferenza sul tema (chiaro/scuro/sistema) viene salvata come valore nell’archiviazione locale (localStorage) del browser. Questa operazione è tecnicamente funzionale, serve esclusivamente a memorizzare la preferenza e non trasmette dati al server o a terzi. Non richiede il consenso.",
          ],
        },
        {
          heading: "7. Cookie",
          paragraphs: [
            "Questo sito non imposta cookie di consenso, di tracciamento o pubblicitari e non utilizza tecniche analoghe per riconoscere l’utente tra dispositivi diversi. Viene effettuato soltanto l’archiviazione tecnicamente necessaria della preferenza sul tema descritta in «Archiviazione locale (tema)», nell’archiviazione locale del browser.",
            "Poiché non vengono utilizzati cookie o tracker che richiedono il consenso, questo sito non necessita di un avviso sui cookie.",
          ],
        },
        {
          heading: "8. Sicurezza dei dati",
          paragraphs: [
            "Il sito viene fornito tramite HTTPS (TLS) cifrato per proteggere la trasmissione da accessi non autorizzati e manomissioni. Oltre a ciò, nei limiti dei mezzi di questo progetto personale vengono adottate misure tecniche e organizzative appropriate per proteggere i dati trattati da perdita, uso improprio e accesso non autorizzato.",
            "Tuttavia, secondo lo stato dell’arte, non è possibile garantire una protezione completa durante la trasmissione su Internet.",
          ],
        },
        {
          heading: "9. Contatti",
          paragraphs: [
            "Se ci contattate all’indirizzo indicato, trattiamo le informazioni che ci communicate (come l’indirizzo e-mail e il contenuto del messaggio) esclusivamente per gestire la vostra richiesta. La base giuridica è il nostro interesse legittimo a rispondere alle richieste ai sensi dell’art. 6.1.f del GDPR.",
            "Le informazioni vengono eliminate quando non sono più necessarie per gestire la richiesta e non sussistono obblighi di conservazione previsti dalla legge.",
          ],
        },
        {
          heading: "10. Conservazione",
          paragraphs: [
            "L’applicazione non conserva in modo permanente i dati delle richieste. I contatori del rate limiting scadono al termine della finestra temporale (circa 60 secondi); la voce corrispondente viene rimossa fisicamente dalla memoria durante una successiva pulizia avviata da ulteriori richieste. Se non arrive altro traffico, una voce già scaduta può rimanere in memoria fino alla pulizia successiva o fino al riavvio del processo. Non viene effettuata alcuna conservazione permanente né valutabile a fini personali.",
            "I dati trasmessi a servizi esterni sono soggetti alle rispettive informative sulla privacy di tali fornitori.",
          ],
        },
        {
          heading: "11. Nessuna decisione automatizzata",
          paragraphs: [
            "Non vengono prese decisioni esclusivamente automatizzate, nemmeno il profiling, ai sensi dell’art. 22 del GDPR. Le valutazioni mostrate dagli strumenti, ad esempio relative al tipo di connessione o all’uso di proxy/hosting, servono soltanto a fornire informazioni direttamente all’utente e non producono effetti giuridici nei suoi confronti.",
          ],
        },
        {
          heading: "12. I diritti dell’utente",
          paragraphs: [
            "Nel rispetto dei requisiti di legge, l’utente ha diritto all’accesso, alla rettifica, alla cancellazione, alla limitazione del trattamento, alla portabilità dei dati e all’opposizione al trattamento basato su interessi legittimi.",
            "Poiché il trattamento è effettuato sulla base di interessi legittimi, l’utente ha altresì il diritto di opporsi in qualsiasi momento a tale trattamento per motivi connessi alla sua situazione personale (art. 21 del GDPR).",
            "L’utente ha inoltre il diritto di proporre reclamo all’autorità di controllo per la protezione dei dati. Per qualsiasi richiesta, è possibile contattarci all’indirizzo: {email}",
          ],
        },
        {
          heading: "13. Modifiche di questa informativa",
          paragraphs: [
            "Questa informativa sulla privacy viene aggiornata quando necessario, ad esempio quando cambiano le funzionalità o i servizi integrati. Si applica in ogni caso la versione pubblicata qui.",
          ],
        },
      ],
    } satisfies PrivacyContent,
    terms: {
      navLabel: "Condizioni d’uso",
      title: "Condizioni d’uso",
      subtitle:
        "Le condizioni che regolano l’uso degli strumenti offerti su questo sito.",
      lastUpdatedLabel: "Ultimo aggiornamento",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "indirizzo di contatto disponibile su richiesta",
      sections: [
        {
          heading: "1. Ambito di applicazione",
          paragraphs: [
            "Le presenti condizioni d’uso si applicano all’utilizzo di questo sito e degli strumenti qui offerti per consultare informazioni su IP, domini e reti. Utilizzando il sito, l’utente accetta le presenti condizioni.",
            "Questo sito è un progetto personale e non commerciale, fornito senza corrispettivo. Se l’utente non accetta le presenti condizioni, è invitato a non utilizzare il sito.",
          ],
        },
        {
          heading: "2. Descrizione del servizio",
          paragraphs: [
            "Il sito mette a disposizione strumenti per consultare informazioni pubblicamente disponibili su indirizzi IP, domini e reti. Alcuni risultati provengono da servizi esterni pubblici e sono riportati senza alcuna garanzia di accuratezza, completezza o attualità.",
            "Gli strumenti sono destinati a un uso da parte di utenti interessati agli aspetti tecnici e non sostituiscono una consulenza professionale in ambito di rete, sicurezza o diritto.",
          ],
        },
        {
          heading: "3. Disponibilità del servizio",
          paragraphs: [
            "Non è garantita una disponibilità specifica o ininterrotta del sito. Il servizio può essere mantenuto, limitato, modificato o sospeso definitivamente in qualsiasi momento senza preavviso.",
            "Per prevenire abusi e sovraccarichi, singole richieste possono essere limitate o rifiutate mediante rate limiting.",
          ],
        },
        {
          heading: "4. Uso accettabile",
          paragraphs: [
            "L’utente si impegna a utilizzare il sito esclusivamente nel rispetto della legge applicabile. In particolare, sono vietati:",
          ],
          bullets: [
            "query automatizzate o su larga scala che compromettono il funzionamento o aggirano i limiti di richiesta;",
            "l’utilizzo degli strumenti per preparare o eseguire attacchi, accessi non autorizzati o altre azioni illecite;",
            "l’inserimento di bersagli o credenziali per i quali l’utente non è autorizzato a eseguire il controllo;",
            "l’aggiramento delle restrizioni tecniche o delle misure di sicurezza del sito;",
            "qualsiasi utilizzo che violi i diritti di terzi o sia contrario alla legge applicabile.",
          ],
        },
        {
          heading: "5. Nessuna garanzia sui risultati",
          paragraphs: [
            "Le informazioni recuperate sono fornite esclusivamente per finalità tecniche e informative. Potrebbero essere incomplete, obsolete o errate e non sostituiscono una consulenza professionale, legale o di sicurezza.",
            "La valutazione e l’utilizzo dei risultati sono di esclusiva responsabilità dell’utente. Non si assume alcuna responsabilità per le decisioni assunte sulla base delle informazioni visualizzate.",
          ],
        },
        {
          heading: "6. Servizi e contenuti esterni",
          paragraphs: [
            "Per fornire i risultati, le richieste vengono trasmesse a servizi esterni. Il rispettivo fornitore è responsabile dei loro contenuti, della disponibilità e del trattamento dei dati. I dettagli sui servizi integrati sono riportati nell’informativa sulla privacy.",
          ],
        },
        {
          heading: "7. Responsabilità",
          paragraphs: [
            "Gli strumenti sono forniti «così come sono», senza alcuna garanzia. Nella misura consentita dalla legge, è esclusa la responsabilità per i danni derivanti dall’utilizzo o dalla non disponibilità del sito, ovvero dalla fiducia nei risultati visualizzati.",
            "Ciò non pregiudica la responsabilità per dolo o colpa grave, né la responsabilità per i danni derivanti da lesioni alla vita, al corpo o alla salute.",
          ],
        },
        {
          heading: "8. Responsabilità per i collegamenti",
          paragraphs: [
            "Il sito può contenere riferimenti a siti web esterni di terzi oppure mostrare risultati che rimandano a essi. Non abbiamo alcuna influenza sul loro contenuto e non ne assumiamo responsabilità. Il rispettivo fornitore è sempre responsabile del contenuto delle pagine collegate.",
          ],
        },
        {
          heading: "9. Proprietà intellettuale",
          paragraphs: [
            "Il progetto del sito e il codice sorgente sottostante sono protetti dalla proprietà intellettuale o disciplinati dalla licenza applicabile del progetto. I dati mostrati tramite gli strumenti provengono in gran parte da fonti pubbliche di terzi e possono essere soggetti alle rispettive condizioni d’uso.",
          ],
        },
        {
          heading: "10. Protezione dei dati",
          paragraphs: [
            "Le informazioni sul trattamento dei dati personali sono disponibili nell’informativa sulla privacy. Utilizzando il sito, l’utente prende conoscenza del trattamento dei dati ivi descritto.",
          ],
        },
        {
          heading: "11. Disposizioni finali",
          paragraphs: [
            "Se una o più disposizioni delle presenti condizioni d’uso fossero o divenissero invalide, la validità delle altre disposizioni non ne risulterebbe compromessa.",
            "Si applica la legge del luogo di stabilimento del titolare, salvo che disposizioni imperative — ad esempio a favore dei consumatori — lo impediscano.",
          ],
        },
        {
          heading: "12. Modifiche delle condizioni",
          paragraphs: [
            "Le presenti condizioni d’uso possono essere adeguate quando necessario, ad esempio quando cambiano le funzionalità o i servizi integrati. In ogni caso si applica la versione pubblicata qui.",
            "Per qualsiasi domanda, è possibile contattarci all’indirizzo: {email}",
          ],
        },
      ],
    } satisfies TermsContent,
  },
  nl: {
    privacy: {
      navLabel: "Privacy",
      title: "Privacybeleid",
      subtitle:
        "Hoe deze site met persoonsgegevens omgaat, met name met IP-adressen.",
      lastUpdatedLabel: "Laatst bijgewerkt",
      lastUpdated: "2026-09-02",
      contactNotConfigured: "contactadres op verzoek beschikbaar",
      controllerNotConfigured:
        "de exploitant van deze site (identiteit op verzoek beschikbaar)",
      sections: [
        {
          heading: "1. Verwerkingsverantwoordelijke",
          paragraphs: [
            "Deze site is een privé, niet-commercieel hobbyproject. De verwerkingsverantwoordelijke in de zin van de Algemene verordening inzake gegevensbescherming (AVG) is {controller}.",
            "Contact voor vragen over gegevensbescherming: {email}",
          ],
        },
        {
          heading: "2. Dataminimalisatie",
          paragraphs: [
            "Deze site gebruikt geen trackingcookies, webanalysetools, advertentienetwerken of gebruikersaccounts. Er worden geen tracking-, advertentie- of persistente gebruikersprofielen opgebouwd en er worden geen persoonsgegevens verwerkt voor marketingdoeleinden.",
            "Wanneer uw eigen IP-adres wordt getoond, worden echter direct netwerkenkenmerken van dat adres afgeleid, zoals de geschatte locatie, de provider/ASN, het verbindingstype en een proxy-/hostingbeoordeling. Dit dient uitsluitend om het resultaat onmiddellijk te tonen en wordt niet permanent opgeslagen of samengevoegd tot een persoonlijk profiel.",
          ],
        },
        {
          heading: "3. Toegangsgegevens en IP-adres",
          paragraphs: [
            "Wanneer u de site opent, verwerkt de server technisch noodzakelijke toegangsgegevens, waaronder uw IP-adres. Het IP-adres wordt gebruikt om de site te leveren en kortstondig om misbruik en overbelasting te voorkomen (rate limiting).",
            "Bij rate limiting worden uitsluitend tijdelijke tellers in het geheugen bewaard (een venster van ongeveer 60 seconden). De toepassing zelf bouwt geen permanente logdatabase met IP-adressen op.",
            "De grondslag is het gerechtvaardigd belang om de site veilig en stabiel te laten werken, op grond van art. 6.1.f van de AVG. Onafhankelijk hiervan kan de hostingprovider eigen serverlogboeken bijhouden.",
          ],
        },
        {
          heading: "4. Verwerking bij gebruik van de tools",
          paragraphs: [
            "De hoofdfunctie van deze site is het opzoeken van informatie over IP-adressen, domeinen en netwerken. Wanneer u uw eigen IP bekijkt of een IP-adres of domein controleert, wordt dat adres of domein naar externe, openbare diensten gestuurd om de gevraagde informatie te verkrijgen.",
            "Sommige tools verwerken meer dan alleen een IP-adres of domein: bij de CDN-controle wordt de volledige door u ingevoerde URL, inclusief het pad en de queryparameters, bij het doel opgevraagd. Met de bereikbaarheidscontroles (ping/database) kunnen de door u ingevoerde inloggegevens, zoals een gebruikersnaam en wachtwoord, tijdens het tot stand komen van de verbinding naar het door u opgegeven doel worden verzonden. Dergelijke invoer wordt uitsluitend voor de betreffende controle gebruikt, niet permanent opgeslagen en niet met deren gedeeld buiten het door u opgegeven doel.",
            "De grondslag is art. 6.1.f van de AVG (verstrekking van de functie die u actief heeft aangevraagd).",
          ],
        },
        {
          heading: "5. Ingebouwde externe diensten",
          paragraphs: [
            "Afhankelijk van de gebruikte tool worden verzoeken aan de volgende diensten gestuurd. Sommige van deze diensten zijn gevestigd buiten de EU/EER, met name in de Verenigde Staten. Een dergelijke doorgifte naar een derde land vindt plaats op basis van de toepasselijke voorwaarden van de aanbieder inzake gegevensbescherming en doorgifte; voor individuele aanbieders kan er geen besluit van adequate bescherming zijn en kunnen passende waarborgen in de zin van art. 46 van de AVG ontbreken. U kunt via het genoemde contactadres nadere informatie opvragen over de grondslag voor doorgifte bij een specifieke dienst.",
          ],
          bullets: [
            "ip-api.com – IP-geolocatie en netwerkmeta-gegevens (serverzijdig).",
            "ipinfo.io – optionele ASN-gegevens als er een token is geconfigureerd (serverzijdig).",
            "stat.ripe.net (RIPE NCC, EU) – openbare routerings- en ASN-gegevens (serverzijdig).",
            "peeringdb.com – openbare netwerk- en peeringprofielen (serverzijdig).",
            "WHOIS/RDAP – bij WHOIS-opzoekingen wordt het ingevoerde doel eerst naar whois.iana.org en daarna naar de bevoegde register- of referral-WHOIS-server gestuurd; rdap.org dient als RDAP-/reservebron (serverzijdig).",
            "DNS-blokkeerlijsten: zen.spamhaus.org (inclusief SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org en bl.blocklist.de; bij reputatiecontroles wordt de opgevraagde IP serverzijdig via DNS-verzoeken verzonden.",
            "api.blocklist.de – daarnaast het aantal gemelde aanvallen voor de opgevraagde IP (serverzijdig, zonder API-sleutel).",
            "Feodo Tracker (feodotracker.abuse.ch) en Spamhaus DROP (drop/dropv6) – botnet-C2- en criminele netblokgegevens; deze gegevensbronnen worden regelmatig serverzijdig gedownload en in de cache opgeslagen. De opgevraagde IP wordt voor deze op gegevensbronnen gebaseerde controles niet naar abuse.ch of Spamhaus verzonden.",
            "api.greynoise.io (Community API) – contextinformatie over scanners op internet; niet-geauthenticeerd of met een optionele gratis sleutel; resultaten worden serverzijdig per IP 24 uur in de cache opgeslagen.",
            "api.abuseipdb.com – optionele reputatie- of misbruiksgegevens als er een sleutel is geconfigureerd (serverzijdig).",
            "dnsbl.httpbl.org (Project Honey Pot) – optionele gegevens over webmisbruik (harvesters, commenterspammers) als er een toegangssleutel is geconfigureerd (serverzijdig).",
            "threatfox-api.abuse.ch – optionele zoekopdrachten naar dreigingsindicatoren (IOC’s) als er een Auth-Key is geconfigureerd (serverzijdig).",
            "flagcdn.com – landenvlaggen. Als een resultaat een land bevat, wordt de bijbehorende landcode serverzijdig via een eigen proxy doorgestuurd naar flagcdn.com (uw IP-adres wordt daarbij niet gedeeld); de vlagafbeelding wordt serverzijdig in de cache opgeslagen.",
            "Recursieve DNS-resolver – bij op controles op basis van een domein wordt de ingevoerde hostnaam opgelost via de DNS-resolver die door de hosting of het systeem is geconfigureerd; die resolver (mogelijk beheerd door de hostingprovider) ontvangt de opgevraagde hostnaam.",
            "api64.ipify.org en checkip.amazonaws.com – bepalen uw eigen IP-adres rechtstreeks vanuit uw browser; uw IP-adres wordt rechtstreeks naar deze diensten verzonden.",
          ],
        },
        {
          heading: "6. Lokale opslag (thema)",
          paragraphs: [
            "Uw themavoorkeur (licht/donker/systeem) wordt als waarde opgeslagen in de lokale opslag (localStorage) van uw browser. Dit is technisch functioneel, dient uitsluitend uw voorkeur en verstuurt geen gegevens naar de server of deren. Hiervoor is geen toestemming vereist.",
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "Deze site plaatst geen toestemmings-, tracking- of advertentiecookies en gebruikt geen vergelijkbare technieken om u op verschillende apparaten te herkennen. Alleen de technisch noodzakelijke opslag van uw themavoorkeur wordt uitgevoerd die is beschreven onder “Lokale opslag (thema)”, in de lokale opslag van uw browser.",
            "Omdat er geen cookies of trackers worden gebruikt waarvoor toestemming is vereist, is voor deze site geen cookiebanner nodig.",
          ],
        },
        {
          heading: "8. Beveiliging van gegevens",
          paragraphs: [
            "De site wordt via versleuteld HTTPS (TLS) geleverd om de overdracht te beschermen tegen ongeoorloofde kennisneming en manipulatie. Daarnaast worden, binnen de mogelijkheden van dit hobbyproject, passende technische en organisatorische maatregelen getroffen om de verwerkte gegevens te beschermen tegen verlies, misbruik en ongeoorloofde toegang.",
            "Volgens de huidige stand van de techniek kan volledige bescherming tijdens overdracht via internet echter niet worden gegarandeerd.",
          ],
        },
        {
          heading: "9. Contact opnemen",
          paragraphs: [
            "Als u ons via het genoemde contactadres benadert, verwerken wij de informatie die u met ons deelt (zoals uw e-mailadres en de inhoud van uw bericht) uitsluitend om uw verzoek te behandelen. De grondslag is ons gerechtvaardigd belang om vragen te beantwoorden op grond van art. 6.1.f van de AVG.",
            "De informatie wordt verwijderd zodra deze niet meer nodig is om het verzoek te behandelen en er geen wettelijke bewaarverplichtingen gelden.",
          ],
        },
        {
          heading: "10. Bewaartermijn",
          paragraphs: [
            "De toepassing bewaart aanvraaggegevens niet permanent. Tellers voor rate limiting verlopen nadat het tijdvenster (ongeveer 60 seconden) is verstreken; de bijbehorende vermelding wordt tijdens een latere opschoning door nieuwe aanvragen fysiek uit het geheugen verwijderd. Als er geen verder verkeer binnenkomt, kan een reeds verlopen vermelding in het geheugen blijven tot de volgende opschoning of totdat het proces opnieuw wordt gestart. Er vindt geen permanente opslag of opslag plaats die persoonlijk kan worden beoordeeld.",
            "Gegevens die naar externe diensten zijn verzonden, zijn onderworpen aan het desbetreffende privacybeleid van die aanbieders.",
          ],
        },
        {
          heading: "11. Geen geautomatiseerde besluitvorming",
          paragraphs: [
            "Er wordt geen uitsluitend geautomatiseerde besluitvorming, waaronder profilering, in de zin van art. 22 van de AVG toegepast. De beoordelingen die de tools tonen, bijvoorbeeld over het verbindingstype of het gebruik van een proxy/hosting, dienen uitsluitend om u rechtstreeks te informeren en hebben geen rechtsgevolgen ten opzichte van u.",
          ],
        },
        {
          heading: "12. Uw rechten",
          paragraphs: [
            "Onder de wettelijke voorwaarden heeft u recht op toegang, rectificatie, wissing, beperking van de verwerking, gegevensportabiliteit en bezwaar tegen verwerking op basis van gerechtvaardigde belangen.",
            "Omdat de verwerking op basis van gerechtvaardigde belangen plaatsvindt, heeft u bovendien het recht om te allen tijde bezwaar te maken tegen die verwerking om redenen die verband houden met uw bijzondere situatie (art. 21 van de AVG).",
            "U hebt ook het recht een klacht in te dienen bij een gegevensbeschermingsautoriteit. Voor elk verzoek kunt u ons bereiken via: {email}",
          ],
        },
        {
          heading: "13. Wijzigingen van dit beleid",
          paragraphs: [
            "Dit privacybeleid wordt zo nodig bijgewerkt, bijvoorbeeld wanneer functies of ingebouwde diensten veranderen. De hier gepubliceerde versie is telkens van toepassing.",
          ],
        },
      ],
    } satisfies PrivacyContent,
    terms: {
      navLabel: "Gebruiksvoorwaarden",
      title: "Gebruiksvoorwaarden",
      subtitle:
        "De voorwaarden die gelden voor uw gebruik van de tools op deze site.",
      lastUpdatedLabel: "Laatst bijgewerkt",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "contactadres op verzoek beschikbaar",
      sections: [
        {
          heading: "1. Toepassingsbereik",
          paragraphs: [
            "Deze gebruiksvoorwaarden gelden voor uw gebruik van deze site en de tools die hier worden aangeboden om informatie over IP-adressen, domeinen en netwerken op te zoeken. Door de site te gebruiken, gaat u akkoord met deze voorwaarden.",
            "Deze site is een privé, niet-commercieel hobbyproject dat gratis wordt aangeboden. Als u niet akkoord gaat met deze voorwaarden, vragen wij u de site niet te gebruiken.",
          ],
        },
        {
          heading: "2. Beschrijving van de dienst",
          paragraphs: [
            "De site biedt tools om openbaar beschikbare informatie over IP-adressen, domeinen en netwerken op te zoeken. Sommige resultaten komen van externe, openbare diensten en worden zonder enige garantie op juistheid, volledigheid of actualiteit weergegeven.",
            "De tools zijn bedoeld voor technisch geïnteresseerde gebruikers en vervangen geen professioneel advies over netwerken, beveiliging of recht.",
          ],
        },
        {
          heading: "3. Beschikbaarheid van de dienst",
          paragraphs: [
            "Er bestaat geen recht op een bepaalde of ononderbroken beschikbaarheid van de site. De dienst kan op elk moment zonder voorafgaande aankondiging worden onderhouden, beperkt, gewijzigd of definitief beëindigd.",
            "Om misbruik en overbelasting te voorkomen, kunnen afzonderlijke aanvragen worden beperkt of geweigerd via rate limiting.",
          ],
        },
        {
          heading: "4. Aanvaardbaar gebruik",
          paragraphs: [
            "U verbindt zich ertoe de site uitsluitend in overeenstemming met de toepasselijke wet te gebruiken. In het bijzonder is het volgende verboden:",
          ],
          bullets: [
            "geautomatiseerde of massale zoekopdrachten op een schaal die de werking belemmert of de aanvraaglimieten omzeilt;",
            "het gebruik van de tools om aanvallen, ongeoorloofde toegang of andere onwettige handelingen voor te bereiden of uit te voeren;",
            "doelen of inloggegevens invoeren waarvoor u niet bevoegd bent om de controle uit te voeren;",
            "technische beperkingen of beveiligingsmaatregelen van de site omzeilen;",
            "elk gebruik dat rechten van derden schendt of in strijd is met de toepasselijke wet.",
          ],
        },
        {
          heading: "5. Geen garantie voor resultaten",
          paragraphs: [
            "De opgehaalde informatie wordt uitsluitend voor technische en informatieve doeleinden verstrekt. Zij kan onvolledig, verouderd of onjuist zijn en vervangt geen professioneel, juridisch of beveiligingsadvies.",
            "De beoordeling en het gebruik van de resultaten zijn uw eigen verantwoordelijkheid. Er wordt geen aansprakelijkheid aanvaard voor beslissingen die u op basis van de getoonde informatie neemt.",
          ],
        },
        {
          heading: "6. Externe diensten en inhoud",
          paragraphs: [
            "Om resultaten te leveren, worden verzoeken naar externe diensten gestuurd. De desbetreffende aanbieder is verantwoordelijk voor hun inhoud, beschikbaarheid en gegevensverwerking. Details over de ingebouwde diensten vindt u in het privacybeleid.",
          ],
        },
        {
          heading: "7. Aansprakelijkheid",
          paragraphs: [
            "De tools worden “zoals ze zijn” en zonder enige garantie verstrekt. Voor zover de wet toestaat, is aansprakelijkheid voor schade die voortvloeit uit het gebruik of de onbeschikbaarheid van de site, of uit het vertrouwen op de getoonde resultaten, uitgesloten.",
            "Dit raakt de aansprakelijkheid voor opzet en grove nalatigheid, alsmede de aansprakelijkheid voor schade als gevolg van letsel aan het leven, het lichaam of de gezondheid, niet.",
          ],
        },
        {
          heading: "8. Aansprakelijkheid voor koppelingen",
          paragraphs: [
            "De site kan verwijzingen naar externe websites van derden bevatten of resultaten tonen die daarnaar verwijzen. We hebben geen invloed op hun inhoud en zijn daarvoor niet aansprakelijk. De desbetreffende aanbieder is steeds verantwoordelijk voor de inhoud van de gekoppelde pagina’s.",
          ],
        },
        {
          heading: "9. Intellectueel eigendom",
          paragraphs: [
            "Het ontwerp van de site en de onderliggende broncode zijn beschermd door het intellectueel eigendomsrecht of vallen onder de toepasselijke licentie van het project. De gegevens die via de tools worden getoond, komen grotendeels uit openbare bronnen van derden en kunnen onder hun gebruiksvoorwaarden vallen.",
          ],
        },
        {
          heading: "10. Gegevensbescherming",
          paragraphs: [
            "Informatie over de verwerking van persoonsgegevens vindt u in het privacybeleid. Door de site te gebruiken, neemt u kennis van de daar beschreven gegevensverwerking.",
          ],
        },
        {
          heading: "11. Slotbepalingen",
          paragraphs: [
            "Als een bepaling van deze gebruiksvoorwaarden ongeldig is of wordt, blijven de overige bepalingen onverminderd van kracht.",
            "Het recht van de vestigingsplaats van de verwerkingsverantwoordelijke is van toepassing, tenzij dwingende wettelijke bepalingen – bijvoorbeeld ten gunste van consumenten – daaraan in de weg staan.",
          ],
        },
        {
          heading: "12. Wijzigingen van deze voorwaarden",
          paragraphs: [
            "Deze gebruiksvoorwaarden kunnen zo nodig worden aangepast, bijvoorbeeld wanneer functies of ingebouwde diensten veranderen. De hier gepubliceerde versie is telkens van toepassing.",
            "Voor vragen kunt u ons bereiken via: {email}",
          ],
        },
      ],
    } satisfies TermsContent,
  },
} satisfies Record<"es" | "fr" | "it" | "nl", LegalContent>;
