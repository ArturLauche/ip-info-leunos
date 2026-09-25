import type { PrivacyContent } from "@/lib/privacy";
import type { TermsContent } from "@/lib/terms";

type LegalEasternLocale = "pl" | "pt-BR" | "pt-PT" | "ja" | "ko" | "ru";

type LegalContent = {
  privacy: PrivacyContent;
  terms: TermsContent;
};

type LegalEasternDocuments = {
  privacy: Record<LegalEasternLocale, PrivacyContent>;
  terms: Record<LegalEasternLocale, TermsContent>;
};

const legalEasternDocuments: LegalEasternDocuments = {
  privacy: {
    pl: {
      navLabel: "Prywatność",
      title: "Polityka prywatności",
      subtitle:
        "Jak ta witryna przetwarza dane osobowe, w szczególności adresy IP.",
      lastUpdatedLabel: "Ostatnia aktualizacja",
      lastUpdated: "2026-09-25",
      contactNotConfigured: "adres kontaktowy na żądanie",
      controllerNotConfigured:
        "operator tej witryny (tożsamość dostępna na żądanie)",
      sections: [
        {
          heading: "1. Administrator",
          paragraphs: [
            "Ta witryna jest prywatnym, niekomercyjnym projektem hobbystycznym. Administratorem w rozumieniu ogólnego rozporządzenia o ochronie danych (RODO) jest {controller}.",
            "Kontakt w sprawach ochrony danych: {email}",
          ],
        },
        {
          heading: "2. Minimalizacja danych",
          paragraphs: [
            "Ta witryna nie używa plików cookie śledzących, narzędzi analityki internetowej, sieci reklamowych ani kont użytkowników. Nie tworzy profili śledzenia, reklamowych ani trwałych profili użytkownika i nie przetwarza danych osobowych w celach marketingowych.",
            "Podczas wyświetlania własnego adresu IP jednak na bieżąco ustala się z niego atrybuty sieciowe, takie jak przybliżona lokalizacja, dostawca/ASN, typ połączenia oraz ocena proxy/hostingu. Służy to wyłącznie do natychmiastowego wyświetlenia wyniku, a dane nie są przechowywane trwale ani łączone w profil osobowy.",
          ],
        },
        {
          heading: "3. Dane dostępu i adres IP",
          paragraphs: [
            "Podczas otwierania witryny serwer przetwarza technicznie niezbędne dane dostępu, w tym adres IP. Adres IP służy do dostarczania witryny oraz krótkotrwale do zapobiegania nadużyciom i przeciążeniom (ograniczanie liczby żądań).",
            "Ograniczanie liczby żądań przechowuje wyłącznie przemijające liczniki w pamięci (okno około 60 sekund). Aplikacja sama nie tworzy trwałej bazy dzienników z adresami IP.",
            "Podstawą prawną jest uzasadniony interes w bezpiecznym i niezawodnym działaniu witryny na podstawie art. 6 ust. 1 lit. f RODO. Niezależnie od tego dostawca hostingu może prowadzić własne logi serwera.",
          ],
        },
        {
          heading: "4. Przetwarzanie podczas korzystania z narzędzi",
          paragraphs: [
            "Główną funkcją tej witryny jest wyszukiwanie informacji o adresach IP, domenach i sieciach. Gdy wyświetlasz własny adres IP lub sprawdzasz adres IP bądź domenę, adres IP lub domena są przekazywane zewnętrznym, publicznym usługom w celu uzyskania żądanych informacji.",
            "Niektóre narzędzia przetwarzają więcej niż adres IP lub domenę: kontrola CDN wysyła do celu pełny wprowadzony adres URL, w tym ścieżkę i parametry zapytania. Testy osiągalności (ping/baza danych) mogą podczas nawiązywania połączenia przekazać wprowadzone dane uwierzytelniające, takie jak nazwa użytkownika i hasło, do wskazanego celu. Takie dane są używane wyłącznie do odpowiedniego testu, nie są przechowywane trwale i nie są przekazywane podmiotom trzecim poza wskazanym celem.",
            "Podstawą prawną jest art. 6 ust. 1 lit. f RODO (realizowanie funkcji, o którą aktywnie poprosiłeś).",
          ],
        },
        {
          heading: "5. Wbudowane usługi zewnętrzne",
          paragraphs: [
            "Zależnie od użytego narzędzia zapytania są kierowane do następujących usług. Część z nich znajduje się poza UE/EOG, w szczególności w Stanach Zjednoczonych. Takie przekazanie do państwa trzeciego odbywa się na podstawie odpowiednich warunków ochrony danych i przekazywania danych dostawcy; w przypadku niektórych dostawców może nie istnieć decyzja o adekwatności, a odpowiednie zabezpieczenia w rozumieniu art. 46 RODO mogą nie występować. Szczegóły dotyczące podstawy przekazania dla konkretnej usługi można uzyskać, kontaktując się z nami za pomocą podanego adresu.",
          ],
          bullets: [
            "ip-api.com – geolokalizacja adresów IP i metadane sieciowe (po stronie serwera).",
            "ipinfo.io – opcjonalne szczegóły ASN, jeśli skonfigurowano token (po stronie serwera).",
            "stat.ripe.net (RIPE NCC, UE) – publiczne dane o routingu i ASN (po stronie serwera).",
            "peeringdb.com – publiczne profile sieci i połączeń peering (po stronie serwera).",
            "WHOIS/RDAP – podczas wyszukiwania WHOIS wprowadzony cel jest najpierw przekazywany do whois.iana.org, a następnie do właściwego serwera WHOIS rejestru lub serwera polecen; rdap.org służy jako źródło RDAP/zapasowe (po stronie serwera).",
            "Listy blokad DNS zen.spamhaus.org (w tym SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – podczas sprawdzania reputacji sprawdzany adres IP jest przekazywany po stronie serwera za pomocą zapytań DNS.",
            "api.blocklist.de – dodatkowo liczba zgłoszonych ataków na sprawdzany adres IP (po stronie serwera, bez klucza API).",
            "Feodo Tracker (feodotracker.abuse.ch) i Spamhaus DROP (drop/dropv6) – zbiory danych dotyczące C2 botnetów oraz bloków sieci uznawanych za przestępcze; te źródła są pobierane i buforowane po stronie serwera w regularnych odstępach. Sprawdzany adres IP nie jest przekazywany do abuse.ch ani Spamhaus w ramach tych testów opartych na źródłach.",
            "api.greynoise.io (Community API) – kontekst skanerów w skali Internetu; bez uwierzytelniania lub z opcjonalnie skonfigurowanym bezpłatnym kluczem; wyniki są buforowane po stronie serwera dla każdego adresu IP przez 24 godziny.",
            "api.abuseipdb.com – opcjonalne dane o reputacji i nadużyciach, jeśli skonfigurowano klucz (po stronie serwera).",
            "dnsbl.httpbl.org (Project Honey Pot) – opcjonalne dane o nadużyciach w Internecie, takie jak harvestery i spamerzy komentujący, jeśli skonfigurowano klucz dostępu (po stronie serwera).",
            "threatfox-api.abuse.ch – opcjonalne wyszukiwanie wskaźników zagrożeń (IOC), jeśli skonfigurowano Auth-Key (po stronie serwera).",
            "flagcdn.com – flagi krajów. Jeśli wynik zawiera kraj, odpowiedni kod kraju jest przekazywany po stronie serwera za pośrednictwem własnego proxy do flagcdn.com (adres IP użytkownika nie jest w tym celu udostępniany); obraz flagi jest buforowany po stronie serwera.",
            "Rekursywny resolver DNS – w testach opartych na domenie wprowadzona nazwa hosta jest rozwiązywana przez resolver DNS skonfigurowany przez hosting lub system; ten resolver, ewentualnie obsługiwany przez dostawcę hostingu, otrzymuje nazwę hosta, której dotyczy zapytanie.",
            "api64.ipify.org i checkip.amazonaws.com – ustalanie własnego adresu IP bezpośrednio w przeglądarce; adres IP jest wtedy przekazywany bezpośrednio do tych usług.",
          ],
        },
        {
          heading: "6. Lokalne przechowywanie",
          paragraphs: [
            "Twój wybór motywu (jasny/ciemny/systemowy) jest przechowywany jako wartość w lokalnym magazynie pamięci przeglądarki. Jest to funkcjonalność techniczna, służy wyłącznie do zachowania preferencji i nie przesyła danych do serwera ani podmiotów trzecich. Nie jest wymagana zgoda.",
          ],
        },
        {
          heading: "7. Pliki cookie",
          paragraphs: [
            "Ta witryna nie ustawia plików cookie wymagających zgody, śledzących ani reklamowych i nie stosuje porównywalnych technik rozpoznawania użytkownika w różnych urządzeniach. Występuje wyłącznie technicznie konieczne przechowywanie opisane w sekcji „Lokalne przechowywanie”: preferencji motywu i wybranego języka, w lokalnym magazynie pamięci przeglądarki.",
            "Ponieważ nie używamy plików cookie ani trackerów wymagających zgody, baner cookie nie jest potrzebny.",
          ],
        },
        {
          heading: "8. Bezpieczeństwo danych",
          paragraphs: [
            "Witryna jest udostępniana przez szyfrowane połączenie HTTPS (TLS), aby chronić transmisję przed nieuprawnionym dostępem i manipulacją. Ponadto, w ramach możliwości tego projektu hobbystycznego, podejmujemy odpowiednie środki techniczne i organizacyjne, aby chronić przetwarzane dane przed utratą, niewłaściwym wykorzystaniem i nieuprawnionym dostępem.",
            "Nie można jednak zagwarantować pełnej ochrony podczas przesyłania przez internet zgodnie z aktualnym stanem techniki.",
          ],
        },
        {
          heading: "9. Kontakt",
          paragraphs: [
            "Jeśli skontaktujesz się z nami za pomocą podanego adresu, przetwarzamy przekazane informacje, na przykład adres e-mail i treść wiadomości, wyłącznie w celu obsługi Twojej sprawy. Podstawą prawną jest nasz uzasadniony interes w odpowiadaniu na zapytania na podstawie art. 6 ust. 1 lit. f RODO.",
            "Informacje są usuwane, gdy nie są już potrzebne do obsługi sprawy i nie obowiązują ustawowe terminy przechowywania.",
          ],
        },
        {
          heading: "10. Okres przechowywania",
          paragraphs: [
            "Aplikacja nie przechowuje trwale danych żądań. Liczniki ograniczające liczbę żądań wygasają po upływie okna czasowego, około 60 sekund; powiązany wpis jest fizycznie usuwany z pamięci podczas późniejszego czyszczenia wywołanego przez kolejne żądania. Jeśli nie pojawi się ruch, wygasły wpis może pozostać w pamięci do następnego czyszczenia lub do ponownego uruchomienia procesu. Nie dochodzi do trwałego przechowywania ani przechowywania umożliwiającego ocenę osobistą.",
            "Dane przekazane usługom zewnętrznym podlegają odpowiednim politykom prywatności tych dostawców.",
          ],
        },
        {
          heading: "11. Brak zautomatyzowanego podejmowania decyzji",
          paragraphs: [
            "Nie ma wyłącznie zautomatyzowanego podejmowania decyzji, w tym profilowania, w rozumieniu art. 22 RODO. Oceny pokazywane przez narzędzia, na przykład dotyczące typu połączenia lub korzystania z proxy/hostingu, służą wyłącznie bezpośredniemu informowaniu użytkownika i nie wywołują skutków prawnych wobec niego.",
          ],
        },
        {
          heading: "12. Twoje prawa",
          paragraphs: [
            "Z zastrzeżeniem warunków prawnych masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz prawo do sprzeciwu wobec przetwarzania opartego na uzasadnionym interesie.",
            "Ponieważ przetwarzanie odbywa się na podstawie uzasadnionego interesu, masz także prawo do sprzeciwu w dowolnym momencie z powodów wynikających z Twojej szczególnej sytuacji (art. 21 RODO).",
            "Masz również prawo złożenia skargi do organu nadzorczego ochrony danych. W sprawach dotyczących ochrony danych możesz skontaktować się z nami pod adresem: {email}",
          ],
        },
        {
          heading: "13. Zmiany polityki",
          paragraphs: [
            "Ta polityka prywatności jest w razie potrzeby aktualizowana, na przykład w razie zmian funkcji lub wbudowanych usług. Zawsze obowiązuje wersja opublikowana tutaj.",
          ],
        },
      ],
    },
    "pt-BR": {
      navLabel: "Privacidade",
      title: "Política de Privacidade",
      subtitle:
        "Como este site trata dados pessoais — em especial, endereços IP.",
      lastUpdatedLabel: "Última atualização",
      lastUpdated: "2026-09-25",
      contactNotConfigured: "endereço de contato mediante solicitação",
      controllerNotConfigured:
        "o controlador deste site (identidade disponível mediante solicitação)",
      sections: [
        {
          heading: "1. Controlador",
          paragraphs: [
            "Este site é um projeto pessoal e não comercial. O controlador, nos termos do Regulamento Geral de Proteção de Dados (GDPR), é {controller}.",
            "Contato para assuntos de proteção de dados: {email}",
          ],
        },
        {
          heading: "2. Minimização de dados",
          paragraphs: [
            "Este site não usa cookies de rastreamento, ferramentas de análise web, redes de publicidade nem contas de usuário. Nenhum perfil de rastreamento, publicidade ou usuário permanente é criado, e dados pessoais não são tratados para fins de marketing.",
            "Ao exibir seu próprio endereço IP, porém, atributos da rede são derivados dele temporariamente, como localização aproximada, provedor/ASN, tipo de conexão e uma avaliação de proxy/hosting. Isso serve apenas para exibir o resultado imediatamente e não é armazenado permanentemente nem combinado em um perfil pessoal.",
          ],
        },
        {
          heading: "3. Dados de acesso e endereço IP",
          paragraphs: [
            "Ao abrir o site, o servidor trata dados de acesso tecnicamente necessários, incluindo seu endereço IP. O endereço IP é usado para entregar o site e, por um breve período, para evitar abuso e sobrecarga (limitação de taxa).",
            "A limitação de taxa mantém apenas contadores transitórios na memória, em uma janela de aproximadamente 60 segundos. O próprio aplicativo não cria um banco de dados permanente de logs com endereços IP.",
            "A base legal é o legítimo interesse em operar o site de forma segura e confiável, nos termos do art. 6(1)(f) do GDPR. Independentemente disso, o provedor de hospedagem pode manter seus próprios logs de servidor.",
          ],
        },
        {
          heading: "4. Tratamento ao usar as ferramentas",
          paragraphs: [
            "A função principal deste site é consultar informações sobre endereços IP, domínios e redes. Quando você exibe seu próprio IP ou verifica um endereço IP ou domínio, esse endereço ou domínio é enviado a serviços públicos externos para obter as informações solicitadas.",
            "Algumas ferramentas tratam mais do que apenas um endereço IP ou domínio: a verificação de CDN solicita ao alvo a URL completa que você digitou, incluindo o caminho e os parâmetros de consulta. As verificações de alcance (ping/banco de dados) podem transmitir credenciais informadas por você, como nome de usuário e senha, ao alvo especificado como parte do estabelecimento da conexão. Esses dados são usados apenas para a verificação correspondente, não são armazenados permanentemente e não são compartilhados com terceiros além do alvo indicado.",
            "A base legal é o art. 6(1)(f) do GDPR (prestação da função que você solicitou ativamente).",
          ],
        },
        {
          heading: "5. Serviços externos incorporados",
          paragraphs: [
            "Dependendo da ferramenta usada, as solicitações são enviadas aos serviços abaixo. Alguns deles ficam fora da UE/EEE, especialmente nos Estados Unidos. Uma eventual transferência para um país terceiro ocorre com base nas condições de proteção e transferência de dados do respectivo provedor; para alguns provedores pode não existir decisão de adequação, e garantias adequadas nos termos do art. 46 do GDPR podem não estar presentes. Você pode solicitar mais informações sobre a base de transferência de um serviço específico pelo endereço de contato informado.",
          ],
          bullets: [
            "ip-api.com – geolocalização de IP e metadados de rede (no servidor).",
            "ipinfo.io – detalhes opcionais de ASN, se um token estiver configurado (no servidor).",
            "stat.ripe.net (RIPE NCC, UE) – dados públicos de roteamento e ASN (no servidor).",
            "peeringdb.com – perfis públicos de rede e peering (no servidor).",
            "WHOIS/RDAP – em consultas WHOIS, o alvo informado é enviado primeiro a whois.iana.org e depois ao servidor WHOIS do registro ou do serviço de encaminhamento pertinente; rdap.org é uma fonte RDAP ou alternativa (no servidor).",
            "Listas de bloqueio DNS zen.spamhaus.org (incluindo SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – nas verificações de reputação, o IP consultado é enviado no servidor por meio de consultas DNS.",
            "api.blocklist.de – também o número de ataques relatados para o IP consultado (no servidor, sem chave de API).",
            "Feodo Tracker (feodotracker.abuse.ch) e Spamhaus DROP (drop/dropv6) – conjuntos de dados de C2 de botnets e de blocos de rede considerados criminais; essas fontes são baixadas e mantidas em cache no servidor em intervalos regulares. O IP consultado não é enviado a abuse.ch ou Spamhaus nessas verificações baseadas nas fontes.",
            "api.greynoise.io (Community API) – contexto de varredores da Internet; sem autenticação ou com uma chave gratuita opcional configurada; os resultados são mantidos em cache no servidor por IP durante 24 horas.",
            "api.abuseipdb.com – dados opcionais de reputação/abuso, se uma chave estiver configurada (no servidor).",
            "dnsbl.httpbl.org (Project Honey Pot) – dados opcionais de abuso na web, como harvesters e spammers de comentários, se uma chave de acesso estiver configurada (no servidor).",
            "threatfox-api.abuse.ch – consultas opcionais a indicadores de ameaça (IOC), se uma Auth-Key estiver configurada (no servidor).",
            "flagcdn.com – bandeiras de países. Quando um resultado inclui um país, o código correspondente é encaminhado no servidor, por meio de um proxy próprio, a flagcdn.com (seu endereço IP não é compartilhado); a imagem da bandeira é mantida em cache no servidor.",
            "Resolvedor DNS recursivo – para verificações baseadas em domínio, o hostname informado é resolvido pelo resolver DNS configurado pela hospedagem ou pelo sistema; esse resolver, possivelmente mantido pelo provedor de hospedagem, recebe o hostname consultado.",
            "api64.ipify.org e checkip.amazonaws.com – descobrem seu próprio endereço IP diretamente no navegador; seu endereço IP é enviado diretamente a esses serviços.",
          ],
        },
        {
          heading: "6. Armazenamento local",
          paragraphs: [
            "Sua preferência de tema (claro/escuro/sistema) é armazenada como um valor no armazenamento local do navegador. Isso é tecnicamente funcional, serve apenas para preservar sua preferência e não transmite dados ao servidor ou a terceiros. Nenhum consentimento é necessário para isso.",
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "Este site não define cookies de consentimento, rastreamento ou publicidade e não usa técnicas semelhantes para reconhecer você em diferentes dispositivos. Ocorre apenas o armazenamento tecnicamente necessário descrito em “Armazenamento local”: sua preferência de tema e sua escolha de idioma, no armazenamento local do navegador.",
            "Como não são usados cookies ou rastreadores que exigem consentimento, não é necessário exibir um banner de cookies.",
          ],
        },
        {
          heading: "8. Segurança dos dados",
          paragraphs: [
            "O site é fornecido por HTTPS (TLS) criptografado para proteger a transmissão contra acesso não autorizado e adulteração. Além disso, dentro dos limites deste projeto pessoal, são tomadas medidas técnicas e organizacionais adequadas para proteger os dados tratados contra perda, uso indevido e acesso não autorizado.",
            "No entanto, de acordo com o estado atual da técnica, não é possível garantir proteção completa durante a transmissão pela internet.",
          ],
        },
        {
          heading: "9. Fale conosco",
          paragraphs: [
            "Se você entrar em contato pelo endereço informado, tratamos as informações que compartilhar, como seu endereço de e-mail e o conteúdo da mensagem, exclusivamente para atender à sua solicitação. A base legal é nosso legítimo interesse em responder a consultas, nos termos do art. 6(1)(f) do GDPR.",
            "As informações são excluídas quando deixarem de ser necessárias para atender à solicitação e não houver obrigação legal de retenção.",
          ],
        },
        {
          heading: "10. Retenção",
          paragraphs: [
            "O aplicativo não armazena permanentemente os dados das solicitações. Os contadores de limitação de taxa expiram após a janela de tempo, aproximadamente 60 segundos; a entrada correspondente é removida fisicamente da memória durante uma limpeza posterior iniciada por novas solicitações. Se não houver mais tráfego, uma entrada já expirada pode permanecer na memória até a próxima limpeza ou até o reinício do processo. Não ocorre armazenamento permanente nem armazenamento que permita uma avaliação pessoal.",
            "Os dados enviados a serviços externos estão sujeitos às respectivas políticas de privacidade desses provedores.",
          ],
        },
        {
          heading: "11. Ausência de decisões automatizadas",
          paragraphs: [
            "Não há decisão exclusivamente automatizada, incluindo perfilamento, nos termos do art. 22 do GDPR. As avaliações exibidas pelas ferramentas, por exemplo sobre o tipo de conexão ou o uso de proxy/hosting, servem apenas para informar você diretamente e não produzem efeitos jurídicos em relação a você.",
          ],
        },
        {
          heading: "12. Seus direitos",
          paragraphs: [
            "Sujeito aos requisitos legais, você tem direito de acesso, retificação, exclusão, restrição do tratamento, portabilidade dos dados e de se opor ao tratamento com base em interesses legítimos.",
            "Como o tratamento é realizado com base em interesses legítimos, você também tem o direito de se opor a qualquer momento, por motivos relacionados à sua situação particular, a esse tratamento (art. 21 do GDPR).",
            "Você também tem o direito de apresentar uma reclamação a uma autoridade de controle de dados. Para qualquer assunto, entre em contato conosco em: {email}",
          ],
        },
        {
          heading: "13. Alterações desta política",
          paragraphs: [
            "Esta política de privacidade será atualizada quando necessário, por exemplo, se os recursos ou os serviços incorporados mudarem. A versão publicada aqui prevalecerá a cada momento.",
          ],
        },
      ],
    },
    "pt-PT": {
      navLabel: "Privacidade",
      title: "Política de Privacidade",
      subtitle:
        "Como este sítio trata os dados pessoais — em especial, os endereços IP.",
      lastUpdatedLabel: "Última atualização",
      lastUpdated: "2026-09-25",
      contactNotConfigured: "endereço de contacto mediante pedido",
      controllerNotConfigured:
        "o responsável por este sítio (identidade disponível mediante pedido)",
      sections: [
        {
          heading: "1. Responsável",
          paragraphs: [
            "Este sítio é um projeto pessoal e não comercial. O responsável, nos termos do Regulamento (UE) 2016/679 relativo à proteção de dados (GDPR), é {controller}.",
            "Contacto para questões de proteção de dados: {email}",
          ],
        },
        {
          heading: "2. Minimização dos dados",
          paragraphs: [
            "Este sítio não utiliza cookies de rastreio, ferramentas de análise web, redes publicitárias nem contas de utilizador. Não são criados perfis de rastreio, publicidade ou utilizador persistentes, nem são tratados dados pessoais para fins de marketing.",
            "Contudo, ao mostrar o seu próprio endereço IP, são temporariamente obtidas características da rede, como a localização aproximada, o fornecedor/ASN, o tipo de ligação e uma avaliação de proxy/hosting. Isto serve apenas para apresentar imediatamente o resultado e não é armazenado de forma permanente nem combinado num perfil pessoal.",
          ],
        },
        {
          heading: "3. Dados de acesso e endereço IP",
          paragraphs: [
            "Ao abrir o sítio, o servidor trata dados de acesso tecnicamente necessários, incluindo o seu endereço IP. O endereço IP é utilizado para entregar o sítio e, durante um curto período, para evitar abuso e sobrecarga (limitação de pedidos).",
            "A limitação de pedidos mantém apenas contadores transitórios na memória, numa janela de aproximadamente 60 segundos. A aplicação não cria, por si só, uma base de dados permanente de registos com endereços IP.",
            "O fundamento jurídico é o interesse legítimo em operar o sítio de forma segura e fiável, nos termos do artigo 6.º, n.º 1, alínea f) do GDPR. Independentemente disso, o fornecedor de alojamento pode manter os seus próprios registos do servidor.",
          ],
        },
        {
          heading: "4. Tratamento durante a utilização das ferramentas",
          paragraphs: [
            "A função principal deste sítio é consultar informação sobre endereços IP, domínios e redes. Quando mostra o seu próprio IP ou verifica um endereço IP ou domínio, esse endereço ou domínio é enviado para serviços públicos externos, a fim de obter a informação solicitada.",
            "Algumas ferramentas tratam mais do que um endereço IP ou domínio: a verificação de CDN pede ao alvo o URL completo que introduziu, incluindo o caminho e os parâmetros da consulta. As verificações de acessibilidade (ping/base de dados) podem transmitir credenciais que introduza, tais como nome de utilizador e palavra-passe, para o alvo indicado como parte da ligação. Esses dados são utilizados apenas para a verificação correspondente, não são armazenados de forma permanente e não são partilhados com terceiros para além do alvo indicado.",
            "O fundamento jurídico é o artigo 6.º, n.º 1, alínea f) do GDPR (prestação da função que solicitou ativamente).",
          ],
        },
        {
          heading: "5. Serviços externos incorporados",
          paragraphs: [
            "Consoante a ferramenta utilizada, os pedidos são enviados para os serviços seguintes. Alguns encontram-se fora da UE/EEE, em especial nos Estados Unidos. Uma eventual transferência para um país terceiro ocorre com base nas condições de proteção e transferência de dados do respetivo fornecedor; para alguns fornecedores pode não existir decisão de adequação, e as garantias adequadas nos termos do artigo 46.º do GDPR podem não estar presentes. Pode solicitar mais informações sobre o fundamento da transferência de um serviço concreto através do endereço de contacto indicado.",
          ],
          bullets: [
            "ip-api.com – geolocalização de IP e metadados de rede (no servidor).",
            "ipinfo.io – detalhes opcionais de ASN, se estiver configurado um token (no servidor).",
            "stat.ripe.net (RIPE NCC, UE) – dados públicos de encaminhamento e ASN (no servidor).",
            "peeringdb.com – perfis públicos de rede e peering (no servidor).",
            "WHOIS/RDAP – nas consultas WHOIS, o alvo introduzido é enviado primeiro para whois.iana.org e depois para o servidor WHOIS do registo ou do serviço de encaminhamento aplicável; rdap.org é uma fonte RDAP ou alternativa (no servidor).",
            "Listas de bloqueio DNS zen.spamhaus.org (incluindo SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – nas verificações de reputação, o IP consultado é enviado no servidor através de consultas DNS.",
            "api.blocklist.de – adicionalmente, o número de ataques comunicados para o IP consultado (no servidor, sem chave de API).",
            "Feodo Tracker (feodotracker.abuse.ch) e Spamhaus DROP (drop/dropv6) – conjuntos de dados de C2 de botnets e de blocos de rede considerados criminais; estas fontes são transferidas e guardadas em cache no servidor a intervalos regulares. O IP consultado não é enviado para abuse.ch ou Spamhaus nestas verificações baseadas nas fontes.",
            "api.greynoise.io (Community API) – contexto de analisadores da Internet; sem autenticação ou com uma chave gratuita opcional configurada; os resultados são guardados em cache no servidor por IP durante 24 horas.",
            "api.abuseipdb.com – dados opcionais de reputação/abuso, se estiver configurada uma chave (no servidor).",
            "dnsbl.httpbl.org (Project Honey Pot) – dados opcionais de abuso na Web, como harvesters e spammers de comentários, se estiver configurada uma chave de acesso (no servidor).",
            "threatfox-api.abuse.ch – consultas opcionais de indicadores de ameaça (IOC), se estiver configurada uma Auth-Key (no servidor).",
            "flagcdn.com – bandeiras de países. Quando um resultado inclui um país, o código correspondente é encaminhado no servidor, através de um proxy próprio, para flagcdn.com (o seu endereço IP não é partilhado); a imagem da bandeira é guardada em cache no servidor.",
            "Resolvedor DNS recursivo – nas verificações baseadas no domínio, o nome de anfitrião introduzido é resolvido pelo resolver DNS configurado pelo alojamento ou pelo sistema; esse resolver, possivelmente operado pelo fornecedor de alojamento, recebe o nome consultado.",
            "api64.ipify.org e checkip.amazonaws.com – descobrem o seu próprio endereço IP diretamente no navegador; o seu endereço IP é enviado diretamente para estes serviços.",
          ],
        },
        {
          heading: "6. Armazenamento local",
          paragraphs: [
            "A sua preferência de tema (claro/escuro/sistema) é guardada como um valor no armazenamento local do navegador. Trata-se de uma funcionalidade técnica, serve apenas para conservar a sua preferência e não transmite dados para o servidor ou para terceiros. Não é necessário consentimento para este efeito.",
          ],
        },
        {
          heading: "7. Cookies",
          paragraphs: [
            "Este sítio não define cookies de consentimento, de rastreio ou publicitários e não utiliza técnicas semelhantes para o reconhecer em diferentes dispositivos. Ocorre apenas o armazenamento tecnicamente necessário descrito em «Armazenamento local»: a sua preferência de tema e a sua escolha de idioma, no armazenamento local do navegador.",
            "Como não são utilizados cookies ou rastreadores que exigem consentimento, não é necessário apresentar uma faixa de cookies.",
          ],
        },
        {
          heading: "8. Segurança dos dados",
          paragraphs: [
            "O sítio é disponibilizado através de HTTPS (TLS) encriptado para proteger a transmissão contra acesso não autorizado e adulteração. Além disso, dentro dos limites deste projeto pessoal, são adotadas medidas técnicas e organizacionais adequadas para proteger os dados tratados contra perda, utilização indevida e acesso não autorizado.",
            "No entanto, de acordo com o estado atual da técnica, não é possível garantir uma proteção completa durante a transmissão pela Internet.",
          ],
        },
        {
          heading: "9. Contacto connosco",
          paragraphs: [
            "Se entrar em contacto connosco através do endereço indicado, tratamos as informações que partilhar, como o seu endereço de correio eletrónico e o conteúdo da mensagem, exclusivamente para tratar o seu pedido. O fundamento jurídico é o nosso interesse legítimo em responder a pedidos, nos termos do artigo 6.º, n.º 1, alínea f) do GDPR.",
            "As informações são eliminadas quando deixarem de ser necessárias para tratar o pedido e não existirem obrigações legais de conservação.",
          ],
        },
        {
          heading: "10. Conservação",
          paragraphs: [
            "A aplicação não armazena permanentemente os dados dos pedidos. Os contadores de limitação expiram após a janela temporal, de aproximadamente 60 segundos; a entrada correspondente é removida fisicamente da memória durante uma limpeza posterior desencadeada por novos pedidos. Se não houver mais tráfego, uma entrada já expirada pode permanecer na memória até à limpeza seguinte ou até ao reinício do processo. Não existe armazenamento permanente nem armazenamento que permita uma avaliação pessoal.",
            "Os dados enviados para serviços externos estão sujeitos às respectivas políticas de privacidade desses fornecedores.",
          ],
        },
        {
          heading: "11. Ausência de decisões automatizadas",
          paragraphs: [
            "Não há decisões exclusivamente automatizadas, incluindo criação de perfis, nos termos do artigo 22.º do GDPR. As avaliações apresentadas pelas ferramentas, por exemplo sobre o tipo de ligação ou a utilização de proxy/hosting, servem apenas para o informar diretamente e não produzem efeitos jurídicos em relação a si.",
          ],
        },
        {
          heading: "12. Os seus direitos",
          paragraphs: [
            "Sujeito aos requisitos legais, tem direito a acesso, retificação, apagamento, limitação do tratamento, portabilidade dos dados e oposição ao tratamento baseado em interesses legítimos.",
            "Como o tratamento é realizado com base em interesses legítimos, também tem o direito de se opor a qualquer momento, por motivos relacionados com a sua situação particular, a esse tratamento (artigo 21.º do GDPR).",
            "Tem igualmente o direito de apresentar uma reclamação a uma autoridade de controlo de dados. Para qualquer questão, pode contactar-nos em: {email}",
          ],
        },
        {
          heading: "13. Alterações desta política",
          paragraphs: [
            "Esta política de privacidade será atualizada sempre que necessário, por exemplo, quando os recursos ou os serviços incorporados mudarem. Aplicar-se-á sempre a versão publicada aqui.",
          ],
        },
      ],
    },
    ja: {
      navLabel: "プライバシー",
      title: "プライバシーポリシー",
      subtitle:
        "本サイトにおける個人データ、特にIPアドレスの取り扱いについて。",
      lastUpdatedLabel: "最終更新日",
      lastUpdated: "2026-09-25",
      contactNotConfigured: "お問い合わせ先の住所（請求時）",
      controllerNotConfigured: "本サイトの運営者（本人確認は請求時）",
      sections: [
        {
          heading: "1. 管理者",
          paragraphs: [
            "本サイトは、非営利の個人ホビープロジェクトです。EU一般データ保護規則（GDPR）に基づく管理者は {controller} です。",
            "個人データに関するお問い合わせ先: {email}",
          ],
        },
        {
          heading: "2. データ最小化",
          paragraphs: [
            "本サイトは、追跡用Cookie、Web分析ツール、広告ネットワーク、ユーザーアカウントを使用しません。追跡・広告・永続的なユーザープロファイルを作成せず、マーケティング目的で個人データを処理することもありません。",
            "ただし、自分のIPアドレスを表示するときには、そのアドレスからおおよその場所、プロバイダー/ASN、接続の種類、プロキシ/ホスティングの利用状況などのネットワーク属性を一時的に導出します。これは結果を直ちに提示するためだけの処理であり、恒久的に保存したり、個人のプロフィールに統合したりすることはありません。",
          ],
        },
        {
          heading: "3. アクセスデータとIPアドレス",
          paragraphs: [
            "サイトを開くと、サーバーはIPアドレスを含む技术上必要なアクセスデータを処理します。IPアドレスは、サイトの配信、および短時間における不正利用や過負荷の防止（レート制限）に使用されます。",
            "レート制限は、メモリ上の一時的なカウンターのみを保持します（期間は約60秒）。アプリケーション自体がIPアドレスを含む永続的なログデータベースを作成することはありません。",
            "法的根拠は、GDPR第6条1項fに基づく、本サイトを安全かつ安定した運用するための正当な利益です。別途、ホスティング事業者は独自のサーバーログを保持する場合があります。",
          ],
        },
        {
          heading: "4. ツール利用時の処理",
          paragraphs: [
            "本サイトの主な機能は、IPアドレス、ドメイン、ネットワークに関する情報を調べることです。自身のIPを表示する場合やIPアドレスまたはドメインを確認する場合、該当するアドレスまたはドメインは、求められた情報を取得するため外部の公開サービスへ送信されます。",
            "一部のツールは、IPアドレスまたはドメイン以外の情報も処理します。CDN検査では、入力されたURL全体（パスとクエリパラメーターを含む）を対象にリクエストします。到達可能性の確認（ping/データベース）では、接続を確立する過程で、ユーザー名やパスワードなどの認証情報を、指定した対象へ送信することがあります。これらの入力は該当する検査にのみ使用され、恒久的には保存されず、指定した対象以外に第三者へ提供されることもありません。",
            "法的根拠は、GDPR第6条1項f（利用者が能動的に求めた機能の提供）です。",
          ],
        },
        {
          heading: "5. 組み込み外部サービス",
          paragraphs: [
            "使用するツールに応じて、以下のサービスへリクエストが送信されます。一部のサービスはEU/EEAの外、特に米国にあります。第三国への移転は、各提供者のデータ保護および移転条件に基づいて行われます。一部の提供者については適合性決定が存在せず、GDPR第46条にいう適切な保障措置も確認できない場合があります。特定のサービスについての移転根拠の詳細を、記載された連絡先へ問い合わせることができます。",
          ],
          bullets: [
            "ip-api.com – IPジオロケーションとネットワークメタデータ（サーバー側）。",
            "ipinfo.io – トークンが設定されている場合のASN詳細（サーバー側）。",
            "stat.ripe.net（RIPE NCC、EU） – 公開ルーティングおよびASNデータ（サーバー側）。",
            "peeringdb.com – 公開ネットワークおよびピアリングプロファイル（サーバー側）。",
            "WHOIS/RDAP – WHOIS検索では、入力した対象を最初にwhois.iana.orgへ送信し、その後、該当するレジストリまたは振替のWHOISサーバーへ送信します。rdap.orgはRDAPおよびフォールバックの情報源です（サーバー側）。",
            "DNSブロックリストzen.spamhaus.org（SBL/CSS/XBL/PBLを含む）、bl.spamcop.net、b.barracudacentral.org、dnsbl.dronebl.org、bl.blocklist.de – 評判検査では、照会したIPをDNSクエリによってサーバー側から送信します。",
            "api.blocklist.de – 照会したIPについて報告された攻撃件数も提供します（サーバー側、APIキー不要）。",
            "Feodo Tracker（feodotracker.abuse.ch）およびSpamhaus DROP（drop/dropv6） – ボットネットC2および犯罪とみなされるネットワークブロックのデータセットです。これらのフィードは定期的にサーバー側でダウンロードされ、キャッシュされます。このフィードに基づく検査では、照会したIPをabuse.chやSpamhausへ送信しません。",
            "api.greynoise.io（Community API） – インターネット全体のスキャナーに関するコンテキスト。認証なし、または任意の無料キーを設定して利用できます。結果はIP単位でサーバー側に24時間キャッシュされます。",
            "api.abuseipdb.com – キーが設定されている場合の任意の評判・不正利用データ（サーバー側）。",
            "dnsbl.httpbl.org（Project Honey Pot） – アクセスキーが設定されている場合の任意のWeb不正利用データ、ハーベスターやコメントスパマーなど（サーバー側）。",
            "threatfox-api.abuse.ch – Auth-Keyが設定されている場合の任意の脅威指標（IOC）検索（サーバー側）。",
            "flagcdn.com – 国旗。結果に国が含まれる場合、対応する国コードが独自のプロキシを通じてサーバー側からflagcdn.comへ送信されます（この過程でIPアドレスは共有されません）。旗の画像はサーバー側でキャッシュされます。",
            "再帰DNSリゾルバー – ドメインベースの検査では、入力されたホスト名は、ホスティングまたはシステムが設定したDNSリゾルバーで解決されます。このリゾルバー（ホスティング事業者が運用している場合があります）は、照会されたホスト名を受け取ります。",
            "api64.ipify.orgとcheckip.amazonaws.com – ブラウザーから直接、自分のIPアドレスを検出します。このときIPアドレスはこれらのサービスへ直接送信されます。",
          ],
        },
        {
          heading: "6. ローカルストレージ",
          paragraphs: [
            "テーマの選択（ライト/ダーク/システム）は、ブラウザーのローカルストレージに値として保存されます。これは機能上必要な技術的処理であり、好みの保持だけに使用し、サーバーや第三者へデータを送信しません。これに同意は必要ありません。",
          ],
        },
        {
          heading: "7. Cookie",
          paragraphs: [
            "本サイトは、同意用、追跡用、広告用のCookieを設定せず、異なる端末間で利用者を認識する類似の手法も使用しません。実施されるのは「ローカルストレージ」で説明した技術的に必要な保存のみで、テーマの好みと選択した言語をブラウザーのローカルストレージに保存するものです。",
            "同意が必要なCookieやトラッカーを使用していないため、本サイトにCookieバナーを表示する必要はありません。",
          ],
        },
        {
          heading: "8. データセキュリティ",
          paragraphs: [
            "サイトへの通信を不正な閲覧や改ざんから保護するため、暗号化HTTPS（TLS）で提供します。さらに、本個人プロジェクトの可能な範囲内において、処理するデータを損失、不正利用、不正アクセスから保護するため、技術的および組織的な措置を適切に講じています。",
            "ただし、現在の技術水準では、インターネット経由の通信について完全な保護を保証することはできません。",
          ],
        },
        {
          heading: "9. お問い合わせ",
          paragraphs: [
            "記載された住所へお問い合わせいただいた場合、メールアドレスやメッセージ本文など、提供いただいた情報をお問い合わせへの対応のみに利用します。法的根拠は、GDPR第6条1項fに基づく、問い合わせへの対応のための正当な利益です。",
            "情報は、お問い合わせへの対応に不要となり、法令上の保存義務もない場合に削除します。",
          ],
        },
        {
          heading: "10. 保存期間",
          paragraphs: [
            "アプリケーションはリクエストデータを恒久的に保存しません。レート制限のカウンターは、期間（約60秒）が経過すると失効し、後続のリクエストによるクリーンアップで、該当する項目がメモリから物理的に削除されます。すでに失効した項目が、次のクリーンアップまたはプロセスの再起動までメモリに残る場合があります。恒久的な保存や個人を評価できる保存は行われません。",
            "外部サービスに送信されたデータには、各プロバイダーのプライバシーポリシーが適用されます。",
          ],
        },
        {
          heading: "11. 自動化による意思決定",
          paragraphs: [
            "GDPR第22条にいう、プロフィール形成を含む、単独の自動化された意思決定は行われません。",
          ],
        },
        {
          heading: "12. お客様の権利",
          paragraphs: [
            "法令の条件に従い、開示、訂正、削除、処理の制限、データポータビリティの権利、および正当な利益に基づく処理への異議を唱える権利を有します。",
            "この処理は正当な利益を根拠として行われるため、GDPR第21条に基づき、あなたの特別な状況に関する理由で、いつでもこの処理に異議を唱えることができます。",
            "また、個人情報保護監督機関に苦情を申し立てる権利があります。",
            "個人データやお問い合わせについては、次の住所までご連絡ください: {email}",
          ],
        },
        {
          heading: "13. 本ポリシーの変更",
          paragraphs: [
            "本ポリシーは、機能や組み込みサービスが変更された場合など、必要に応じて更新されます。常に本ページに掲載されているバージョンが適用されます。",
          ],
        },
      ],
    },
    ko: {
      navLabel: "개인정보 보호",
      title: "개인정보 보호정책",
      subtitle: "이 사이트가 개인정보, 특히 IP 주소를 처리하는 방식입니다.",
      lastUpdatedLabel: "마지막 업데이트",
      lastUpdated: "2026-09-25",
      contactNotConfigured: "요청 시 제공되는 연락처",
      controllerNotConfigured: "이 사이트의 운영자(요청 시 신원 확인 가능)",
      sections: [
        {
          heading: "1. 관리자",
          paragraphs: [
            "이 사이트는 비상업적인 개인 취미 프로젝트입니다. 일반 개인정보 보호규정(GDPR)에 따른 관리자는 {controller}입니다.",
            "개인정보 보호 문의처: {email}",
          ],
        },
        {
          heading: "2. 데이터 최소화",
          paragraphs: [
            "이 사이트는 추적 쿠키, 웹 분석 도구, 광고 네트워크 또는 사용자 계정을 사용하지 않습니다. 추적, 광고 또는 지속적인 사용자 프로필을 만들지 않으며 마케팅 목적으로 개인정보를 처리하지 않습니다.",
            "다만 사용자의 IP 주소를 표시할 때 해당 주소에서 대략적인 위치, 제공자/ASN, 연결 유형, 프록시/호스팅 사용 여부 등의 네트워크 특성을 임시로 도출합니다. 이는 결과를 즉시 표시하기 위한 것으로만 영구 저장하지 않으며 개인 프로필로 결합하지 않습니다.",
          ],
        },
        {
          heading: "3. 접근 데이터와 IP 주소",
          paragraphs: [
            "사이트를 열면 서버는 IP 주소를 포함한 기술적으로 필요한 접근 데이터를 처리합니다. IP 주소는 사이트를 제공하는 데 사용되며, 짧은 시간 동안 오용과 과부하를 방지하는 데에도 사용됩니다(요청 속도 제한).",
            "요청 속도 제한은 약 60초의 시간 창 동안 메모리에 임시 카운터만 유지합니다. 애플리케이션 자체가 IP 주소를 포함한 영구 로그 데이터베이스를 만들지는 않습니다.",
            "법적 근거는 GDPR 제6조1항 f에 따른 사이트를 안전하고 안정적으로 운영하기 위한 정당한 이익입니다. 이와 별도로 호스팅 제공자는 자체 서버 로그를 보관할 수 있습니다.",
          ],
        },
        {
          heading: "4. 도구 사용 시 처리",
          paragraphs: [
            "이 사이트의 핵심 기능은 IP 주소, 도메인 및 네트워크에 관한 정보를 조회하는 것입니다. 사용자가 자신의 IP를 표시하거나 IP 주소 또는 도메인을 확인하면 요청한 정보를 얻기 위해 해당 주소 또는 도메인이 외부의 공개 서비스로 전송됩니다.",
            "일부 도구는 IP 주소 또는 도메인 이상의 정보를 처리합니다. CDN 검사에서는 사용자가 입력한 전체 URL(경로 및 쿼리 매개변수 포함)을 대상에 요청합니다. 연결 가능성 검사(핑/데이터베이스)에서는 연결을 설정하는 과정에서 사용자 이름과 비밀번호 등 사용자가 입력한 인증 정보를 사용자가 지정한 대상으로 전송할 수 있습니다. 이러한 입력은 해당 검사에만 사용되고 영구 저장되지 않으며 사용자가 지정한 대상 외의 제3자에게 공유되지 않습니다.",
            "법적 근거는 GDPR 제6조1항 f(사용자가 요청한 기능 제공)입니다.",
          ],
        },
        {
          heading: "5. 포함된 외부 서비스",
          paragraphs: [
            "사용한 도구에 따라 다음 서비스로 요청이 전송됩니다. 일부 서비스는 EU/EEA 외부, 특히 미국에 있습니다. 제3국으로의 전송은 각 제공자의 데이터 보호 및 전송 조건에 따라 이루어지며, 일부 제공자에게는 적합성 결정이 없고 GDPR 제46조에 따른 적절한 보호 장치도 없을 수 있습니다. 특정 서비스의 전송 근거에 대한 자세한 정보는 아래 연락처로 요청할 수 있습니다.",
          ],
          bullets: [
            "ip-api.com – IP 위치 및 네트워크 메타데이터(서버 측).",
            "ipinfo.io – 토큰이 구성된 경우 선택적 ASN 세부 정보(서버 측).",
            "stat.ripe.net(RIPE NCC, EU) – 공개 라우팅 및 ASN 데이터(서버 측).",
            "peeringdb.com – 공개 네트워크 및 피어링 프로필(서버 측).",
            "WHOIS/RDAP – WHOIS 조회에서 입력한 대상은 먼저 whois.iana.org로 전송된 후 해당 등록 기관 또는 referral WHOIS 서버로 전송됩니다. rdap.org는 RDAP 및 대체 출처로 사용됩니다(서버 측).",
            "DNS 차단 목록 zen.spamhaus.org(SBL/CSS/XBL/PBL 포함), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – 평판 검사에서 조회한 IP는 DNS 쿼리를 통해 서버 측에서 전송됩니다.",
            "api.blocklist.de – 조회한 IP에 대해 보고된 공격 횟수도 제공합니다(서버 측, API 키 불필요).",
            "Feodo Tracker(feodotracker.abuse.ch) 및 Spamhaus DROP(drop/dropv6) – 봇넷 C2 및 범죄 네트워크 블록 데이터셋입니다. 이 피드는 정기적으로 서버 측에서 다운로드되어 캐시됩니다. 이 피드 기반 검사에서는 조회한 IP를 abuse.ch 또는 Spamhaus로 전송하지 않습니다.",
            "api.greynoise.io(Community API) – 인터넷 전체 스캐너에 대한 맥락 정보입니다. 인증 없이 또는 선택적으로 구성된 무료 키를 사용하여 이용할 수 있으며, 결과는 IP별로 서버 측에 24시간 동안 캐시됩니다.",
            "api.abuseipdb.com – 키가 구성된 경우 선택적 평판/오용 데이터(서버 측).",
            "dnsbl.httpbl.org(Project Honey Pot) – 액세스 키가 구성된 경우 선택적 웹 오용 데이터, 하베스터와 댓글 스팸 등(서버 측).",
            "threatfox-api.abuse.ch – Auth-Key가 구성된 경우 선택적 위협 지표(IOC) 조회(서버 측).",
            "flagcdn.com – 국가 깃발입니다. 결과에 국가가 포함되면 해당 국가 코드가 자체 프록시를 통해 서버 측에서 flagcdn.com으로 전달됩니다(이 과정에서 사용자의 IP 주소는 공유되지 않음). 깃발 이미지는 서버 측에서 캐시됩니다.",
            "재귀 DNS 리졸버 – 도메인 기반 검사에서는 입력한 호스트 이름이 호스팅 또는 시스템이 구성한 DNS 리졸버로 해석됩니다. 이 리졸버는 호스팅 제공자가 운영할 수 있으며 조회된 호스트 이름을 받습니다.",
            "api64.ipify.org 및 checkip.amazonaws.com – 브라우저에서 사용자의 IP 주소를 직접 확인합니다. 이때 IP 주소가 해당 서비스로 직접 전송됩니다.",
          ],
        },
        {
          heading: "6. 로컬 저장소",
          paragraphs: [
            "테마 환경설정(밝게/어둡게/시스템)을 브라우저의 로컬 저장소에 값으로 저장합니다. 이는 기술적으로 필요한 기능이며 사용자의 환경설정을 유지하기 위한 목적으로만 사용됩니다. 서버나 제3자에게 데이터를 전송하지 않으며 이를 위한 동의가 필요하지 않습니다.",
          ],
        },
        {
          heading: "7. 쿠키",
          paragraphs: [
            "이 사이트는 동의, 추적 또는 광고 쿠키를 설정하지 않으며 여러 기기에서 사용자를 인식하는 유사한 기법도 사용하지 않습니다. “로컬 저장소”에 설명된 기술적으로 필요한 저장만 이루어지며, 테마 환경설정과 선택한 언어를 브라우저의 로컬 저장소에 저장합니다.",
            "동의가 필요한 쿠키나 추적기를 사용하지 않으므로 쿠키 배너는 필요하지 않습니다.",
          ],
        },
        {
          heading: "8. 데이터 보안",
          paragraphs: [
            "전송 데이터가 무단으로 열람되거나 변조되지 않도록 암호화된 HTTPS(TLS)로 사이트를 제공합니다. 또한 이 개인 프로젝트의 가능한 범위 안에서 처리되는 데이터의 손실, 오용 및 무단 접근을 방지하기 위해 적절한 기술적·조직적 조치를 취합니다.",
            "그러나 현재 기술 수준만으로 인터넷을 통한 전송의 완전한 보호를 보장할 수는 없습니다.",
          ],
        },
        {
          heading: "9. 문의하기",
          paragraphs: [
            "제공된 연락처로 문의하면 이메일 주소와 메시지 내용 등 사용자가 제공한 정보를 해당 문의 처리만을 위해 처리합니다. 법적 근거는 GDPR 제6조1항 f에 따른 문의 응대에 대한 우리의 정당한 이익입니다.",
            "정보는 문의 처리에 더 이상 필요하지 않고 법적 보존 의무가 없는 경우 삭제됩니다.",
          ],
        },
        {
          heading: "10. 보관 기간",
          paragraphs: [
            "애플리케이션은 요청 데이터를 영구적으로 저장하지 않습니다. 요청 속도 제한 카운터는 약 60초의 시간 창이 지나면 만료되며, 이후 요청으로 인한 정리 과정에서 연결된 항목이 메모리에서 실제로 제거됩니다. 추가 트래픽이 없다면 이미 만료된 항목이 다음 정리 또는 프로세스 재시작 때까지 메모리에 남아 있을 수 있습니다. 영구 저장하거나 개인을 평가할 수 있는 형태로 저장하지 않습니다.",
            "외부 서비스로 전송된 데이터는 해당 제공자의 개인정보 보호 정책에 따라 처리됩니다.",
          ],
        },
        {
          heading: "11. 자동화된 결정 없음",
          paragraphs: [
            "GDPR 제22조에 따른 프로파일링을 포함한 전적으로 자동화된 결정은 이루어지지 않습니다. 도구가 표시하는 연결 유형 또는 프록시/호스팅 사용 여부 등의 평가는 사용자에게 직접 정보를 제공하기 위한 것일 뿐이며 사용자에게 대한 법적 효과를 발생시키지 않습니다.",
          ],
        },
        {
          heading: "12. 이용자의 권리",
          paragraphs: [
            "법적 요건에 따라 이용자는 열람, 정정, 삭제, 처리 제한, 데이터 이동성 및 정당한 이익에 기반한 처리에 대한 이의제기권을 가집니다.",
            "처리가 정당한 이익에 기반하므로 이용자는 자신의 특별한 상황에 관한 이유로 언제든지 해당 처리에 이의를 제기할 권리도 있습니다(GDPR 제21조).",
            "또한 개인정보 보호 감독기관에 불고를 제기할 권리가 있습니다. 문의 사항은 {email}로 연락하실 수 있습니다.",
          ],
        },
        {
          heading: "13. 이 정책의 변경",
          paragraphs: [
            "기능이나 포함된 서비스가 변경되는 경우 등 필요에 따라 이 개인정보 보호정책을 업데이트합니다. 언제나 이 페이지에 게시된 버전이 적용됩니다.",
          ],
        },
      ],
    },
    ru: {
      navLabel: "Конфиденциальность",
      title: "Политика конфиденциальности",
      subtitle:
        "Как этот сайт обрабатывает персональные данные, в частности IP-адреса.",
      lastUpdatedLabel: "Последнее обновление",
      lastUpdated: "2026-09-25",
      contactNotConfigured: "контактный адрес по запросу",
      controllerNotConfigured:
        "оператор этого сайта (идентификатор предоставляется по запросу)",
      sections: [
        {
          heading: "1. Оператор",
          paragraphs: [
            "Этот сайт — частный некоммерческий проект, созданный в личных целях. Оператором в смысле Общего регламента по защите данных (GDPR) является {controller}.",
            "Контакты по вопросам защиты данных: {email}",
          ],
        },
        {
          heading: "2. Минимизация данных",
          paragraphs: [
            "Сайт не использует отслеживающие файлы cookie, инструменты веб-аналитики, рекламные сети или учетные записи пользователей. На сайте не создаются профили отслеживания, рекламные или постоянные профили пользователей, а персональные данные не обрабатываются в маркетинговых целях.",
            "Однако при отображении вашего собственного IP-адреса из него временно выводятся сетевые характеристики, например приблизительное местоположение, провайдер/ASN, тип соединения и оценка использования прокси/хостинга. Это служит только для немедленного отображения результата; данные не хранятся постоянно и не объединяются в личный профиль.",
          ],
        },
        {
          heading: "3. Данные доступа и IP-адрес",
          paragraphs: [
            "При открытии сайта сервер обрабатывает технически необходимые данные доступа, включая ваш IP-адрес. IP-адрес используется для предоставления сайта, а также непродолжительное время для предотвращения злоупотреблений и перегрузки (ограничения частоты запросов).",
            "Ограничение частоты запросов хранит в памяти только временные счетчики (окно примерно 60 секунд). Само приложение не создает постоянную базу журналов с IP-адресами.",
            "Правовым основанием является законный интерес в безопасной и стабильной работе сайта согласно ст. 6(1)(f) GDPR. Независимо от этого хостинг-провайдер может вести собственные журналы сервера.",
          ],
        },
        {
          heading: "4. Обработка при использовании инструментов",
          paragraphs: [
            "Основная функция этого сайта — получение сведений об IP-адресах, доменах и сетях. Когда вы отображаете собственный IP-адрес или проверяете IP-адрес либо домен, этот адрес или домен передается внешним публичным сервисам для получения запрошенной информации.",
            "Некоторые инструменты обрабатывают не только IP-адрес или домен: проверка CDN запрашивает у цели полный введенный вами URL, включая путь и параметры запроса. Проверки достижимости (ping/база данных) при установлении соединения могут передать введенные вами учетные данные, например имя пользователя и пароль, указанной цели. Такие входные данные используются только для соответствующей проверки, постоянно не хранятся и не передаются третьим лицам помимо указанной цели.",
            "Правовым основанием является ст. 6(1)(f) GDPR (предоставление функции, которую вы активно запросили).",
          ],
        },
        {
          heading: "5. Подключенные внешние сервисы",
          paragraphs: [
            "В зависимости от используемого инструмента запросы направляются в следующие сервисы. Часть этих сервисов находится за пределами ЕС/ЕЭЗ, в частности в США. Такая передача в третью страницу осуществляется на основании соответствующих условий защиты и передачи данных провайдера; у отдельных провайдеров может отсутствовать решение о достаточности, а надлежащие гарантии в смысле ст. 46 GDPR могут быть недоступны. Более подробную информацию об основании передачи для конкретного сервиса можно запросить по указанному контактному адресу.",
          ],
          bullets: [
            "ip-api.com — геолокация IP-адресов и сетевые метаданные (на стороне сервера).",
            "ipinfo.io — необязательные сведения об ASN, если настроен токен (на стороне сервера).",
            "stat.ripe.net (RIPE NCC, ЕС) — публичные данные о маршрутизации и ASN (на стороне сервера).",
            "peeringdb.com — публичные профили сетей и пиринга (на стороне сервера).",
            "WHOIS/RDAP — при запросе WHOIS введенная цель сначала передается в whois.iana.org, а затем на соответствующий сервер WHOIS реестра или реферального сервиса; rdap.org служит источником RDAP и резервным источником (на стороне сервера).",
            "Списки блокировок DNS zen.spamhaus.org (включая SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de — при проверке репутации запрашиваемый IP-адрес передается на стороне сервера с помощью DNS-запросов.",
            "api.blocklist.de — дополнительно предоставляет число зарегистрированных атак на запрашиваемый IP-адрес (на стороне сервера, без ключа API).",
            "Feodo Tracker (feodotracker.abuse.ch) и Spamhaus DROP (drop/dropv6) — наборы данных C2 ботнетов и блоков сетей, признанных преступными; эти источники периодически загружаются и кэшируются на стороне сервера. При проверках на основе этих источников запрашиваемый IP-адрес не передается в abuse.ch или Spamhaus.",
            "api.greynoise.io (Community API) — контекст интернет-сканеров; без аутентификации или с необязательным настроенным бесплатным ключом; результаты кэшируются на стороне сервера для каждого IP-адреса в течение 24 часов.",
            "api.abuseipdb.com — необязательные данные о репутации и злоупотреблениях, если настроен ключ (на стороне сервера).",
            "dnsbl.httpbl.org (Project Honey Pot) — необязательные данные о злоупотреблениях в интернете, например от харвестеров и спамеров в комментариях, если настроен ключ доступа (на стороне сервера).",
            "threatfox-api.abuse.ch — необязательный поиск индикаторов угроз (IOC), если настроен Auth-Key (на стороне сервера).",
            "flagcdn.com — флаги стран. Если результат содержит страну, соответствующий код страны передается на стороне сервера через собственный прокси на flagcdn.com (ваш IP-адрес при этом не передается); изображение флага кэшируется на стороне сервера.",
            "Рекурсивный DNS-резолвер — при проверках по домену введенное имя узла разрешается через DNS-резолвер, настроенный хостингом или системой; этот резолвер (которым может управлять хостинг-провайдер) получает запрашиваемое имя узла.",
            "api64.ipify.org и checkip.amazonaws.com — определяют ваш собственный IP-адрес непосредственно в браузере; ваш IP-адрес напрямую передается этим сервисам.",
          ],
        },
        {
          heading: "6. Локальное хранилище",
          paragraphs: [
            "Ваш выбор темы (светлая/тёмная/системная) сохраняется как значение в локальном хранилище браузера. Это технически необходимое средство, которое служит только для сохранения вашего выбора и не передает данные серверу или третьим лицам. Согласие для этого не требуется.",
          ],
        },
        {
          heading: "7. Файлы cookie",
          paragraphs: [
            "Этот сайт не устанавливает файлы cookie для согласия, отслеживания или рекламы и не использует сопоставимые технологии для распознавания вас на разных устройствах. Происходит только технически необходимое сохранение, описанное в разделе «Локальное хранилище»: выбор темы и выбранный язык сохраняются в локальном хранилище браузера.",
            "Поскольку файлы cookie и трекеры, требующие согласия, не используются, баннер cookie на сайте не нужен.",
          ],
        },
        {
          heading: "8. Безопасность данных",
          paragraphs: [
            "Сайт предоставляется по зашифрованному HTTPS (TLS), чтобы защитить передачу от несанкционированного доступа и изменения. Кроме того, в пределах возможностей этого личного проекта принимаются надлежащие технические и организационные меры для защиты обрабатываемых данных от утраты, злоупотребления и несанкционированного доступа.",
            "Однако с учетом современного уровня технологий нельзя гарантировать полную защиту при передаче через интернет.",
          ],
        },
        {
          heading: "9. Связь с нами",
          paragraphs: [
            "Если вы свяжетесь с нами по указанному адресу, мы обрабатываем предоставленную вами информацию, например адрес электронной почты и содержание сообщения, исключительно для рассмотрения вашего обращения. Правовым основанием является наш законный интерес в ответах на запросы согласно ст. 6(1)(f) GDPR.",
            "Информация удаляется, когда она больше не нужна для рассмотрения обращения и отсутствуют установленные законом сроки хранения.",
          ],
        },
        {
          heading: "10. Сроки хранения",
          paragraphs: [
            "Приложение не хранит данные запросов постоянно. Счетчики ограничения частоты запросов истекают после временного окна примерно в 60 секунд; связанная с ними запись физически удаляется из памяти при последующей очистке, инициированной новыми запросами. Если нового трафика нет, уже истекшая запись может оставаться в памяти до следующей очистки или перезапуска процесса. Постоянное хранение и хранение, позволяющее оценивать конкретного человека, не осуществляются.",
            "Данные, переданные внешним сервисам, подпадают под соответствующие политики конфиденциальности этих провайдеров.",
          ],
        },
        {
          heading: "11. Отсутствие автоматизированных решений",
          paragraphs: [
            "На сайте не принимаются исключительно автоматизированные решения, включая профилирование, в смысле ст. 22 GDPR. Оценки, показываемые инструментами, например о типе соединения или использовании прокси/хостинга, служат только для непосредственного информирования вас и не влекут юридических последствий в отношении вас.",
          ],
        },
        {
          heading: "12. Ваши права",
          paragraphs: [
            "При соблюдении требований закона вы имеете право на доступ, исправление, удаление, ограничение обработки, переносимость данных и возражение против обработки на основании законных интересов.",
            "Поскольку обработка осуществляется на основании законных интересов, вы также имеете право в любое время возразить против такой обработки по причинам, связанным с вашей конкретной ситуацией (ст. 21 GDPR).",
            "Вы также имеете право подать жалобу в орган по надзору за защитой данных. По любым вопросам вы можете связаться с нами по адресу: {email}",
          ],
        },
        {
          heading: "13. Изменения настоящей политики",
          paragraphs: [
            "Настоящая политика конфиденциальности при необходимости обновляется, например, если изменятся функции или подключенные сервисы. Каждый раз применяется опубликованная здесь версия.",
          ],
        },
      ],
    },
  },
  terms: {
    pl: {
      navLabel: "Warunki korzystania",
      title: "Warunki korzystania",
      subtitle:
        "Warunki regulujące korzystanie z narzędzi udostępnianych w tym serwisie.",
      lastUpdatedLabel: "Ostatnia aktualizacja",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "adres kontaktowy na żądanie",
      sections: [
        {
          heading: "1. Zakres",
          paragraphs: [
            "Te warunki korzystania mają zastosowanie do korzystania z tej witryny i udostępnianych na niej narzędzi do wyszukiwania informacji o adresach IP, domenach i sieciach. Korzystając z witryny, akceptujesz te warunki.",
            "Ta witryna jest prywatnym, niekomercyjnym projektem hobbystycznym i jest udostępniana bezpłatnie. Jeśli nie akceptujesz tych warunków, nie korzystaj z witryny.",
          ],
        },
        {
          heading: "2. Opis usługi",
          paragraphs: [
            "Witryna udostępnia narzędzia do wyszukiwania publicznie dostępnych informacji o adresach IP, domenach i sieciach. Część wyników pochodzi z zewnętrznych, publicznych usług i jest przedstawiana bez gwarancji ich poprawności, kompletności ani aktualności.",
            "Narzędzia są przeznaczone dla użytkowników zainteresowanych kwestiami technicznymi i nie zastępują profesjonalnych porad dotyczących sieci, bezpieczeństwa ani prawa.",
          ],
        },
        {
          heading: "3. Dostępność usługi",
          paragraphs: [
            "Nie ma gwarancji określonej ani nieprzerwanej dostępności witryny. Jej działanie może być w każdej chwili bez uprzedzenia utrzymywane, ograniczane, zmieniane lub trwale zakończone.",
            "W celu zapobiegania nadużyciom i przeciążeniom poszczególne żądania mogą być ograniczane pod względem częstotliwości albo odrzucane.",
          ],
        },
        {
          heading: "4. Dozwolone korzystanie",
          paragraphs: [
            "Zobowiązujesz się korzystać z witryny wyłącznie zgodnie z obowiązującym prawem. W szczególności zabrania się:",
          ],
          bullets: [
            "automatycznego lub masowego wyszukiwania w takim zakresie, który utrudnia działanie witryny lub omija limity żądań;",
            "wykorzystywania narzędzi do przygotowania lub przeprowadzania ataków, nieuprawnionego dostępu lub innych niezgodnych z prawem działań;",
            "wprowadzania celów lub danych uwierzytelniających, których sprawdzanie nie jest uprawnione;",
            "omijania technicznych ograniczeń lub zabezpieczeń witryny;",
            "korzystania w sposób naruszający prawa osób trzecich lub sprzeczny z obowiązującym prawem.",
          ],
        },
        {
          heading: "5. Brak gwarancji wyników",
          paragraphs: [
            "Uzyskane informacje są udostępniane wyłącznie w celach technicznych i informacyjnych. Mogą być niekompletne, nieaktualne lub nieprawidłowe i nie zastępują profesjonalnych porad prawnych, technicznych ani dotyczących bezpieczeństwa.",
            "Ocena i wykorzystanie wyników leżą w Twojej własnej odpowiedzialności. Nie ponosimy odpowiedzialności za decyzje podjęte na podstawie wyświetlanych informacji.",
          ],
        },
        {
          heading: "6. Usługi zewnętrzne i treści",
          paragraphs: [
            "W celu dostarczenia wyników zapytania są kierowane do usług zewnętrznych. Za ich treść, dostępność i przetwarzanie danych odpowiada odpowiedni dostawca. Szczegóły dotyczące wbudowanych usług znajdują się w polityce prywatności.",
          ],
        },
        {
          heading: "7. Odpowiedzialność",
          paragraphs: [
            "Narzędzia są udostępniane „w takim stanie, w jakim są”, bez jakiejkolwiek gwarancji. W zakresie dopuszczalnym przez prawo wyłączamy odpowiedzialność za szkody wynikające z korzystania z witryny lub jej niedostępności albo z polegania na wyświetlanych wynikach.",
            "Nie narusza to odpowiedzialności za umyślne działanie lub rażące niedbalstwo ani za szkody wynikające z uszkodzenia życia, ciała lub zdrowia.",
          ],
        },
        {
          heading: "8. Odpowiedzialność za odnośniki",
          paragraphs: [
            "Witryna może zawierać odsyłacze do zewnętrznych witryn osób trzecich lub wyświetlać wyniki prowadzące do takich witryn. Nie mamy wpływu na ich treść i nie ponosimy za nią odpowiedzialności. Za treść połączonych stron odpowiada zawsze ich dostawca.",
          ],
        },
        {
          heading: "9. Własność intelektualna",
          paragraphs: [
            "Projekt witryny oraz leżący u jej podstaw kod źródłowy podlegają ochronie praw własności intelektualnej lub warunkom licencji projektu. Dane wyświetlane przez narzędzia pochodzą głównie z publicznych źródeł osób trzecich i mogą podlegać ich warunkom korzystania.",
          ],
        },
        {
          heading: "10. Ochrona danych",
          paragraphs: [
            "Informacje o sposobie przetwarzania danych osobowych znajdują się w polityce prywatności. Korzystając z witryny, zapoznajesz się z opisanym tam przetwarzaniem danych.",
          ],
        },
        {
          heading: "11. Postanowienia końcowe",
          paragraphs: [
            "Jeśli którekolwiek postanowienie tych warunków jest lub stanie się nieskuteczne, pozostałe postanowienia zachowują ważność.",
            "Stosuje się prawo państwa, w którym znajduje się administrator, chyba że bezwzględnie obowiązujące przepisy — na przykład na korzyść konsumentów — stanowią inaczej.",
          ],
        },
        {
          heading: "12. Zmiany warunków",
          paragraphs: [
            "Te warunki mogą być w razie potrzeby dostosowywane, na przykład w razie zmian funkcji lub wbudowanych usług. Zawsze obowiązuje wersja opublikowana tutaj.",
            "W razie pytań możesz skontaktować się z nami pod adresem: {email}",
          ],
        },
      ],
    },
    "pt-BR": {
      navLabel: "Termos de Uso",
      title: "Termos de Uso",
      subtitle: "Os termos que regem o uso das ferramentas oferecidas aqui.",
      lastUpdatedLabel: "Última atualização",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "endereço de contato mediante solicitação",
      sections: [
        {
          heading: "1. Escopo",
          paragraphs: [
            "Estes termos de uso se aplicam ao uso deste site e das ferramentas oferecidas para consultar informações de IP, domínio e rede. Ao usar o site, você concorda com estes termos.",
            "Este site é um projeto pessoal e não comercial e é oferecido gratuitamente. Se não concordar com estes termos, não use o site.",
          ],
        },
        {
          heading: "2. Descrição do serviço",
          paragraphs: [
            "O site oferece ferramentas para consultar informações publicamente disponíveis sobre endereços IP, domínios e redes. Alguns resultados vêm de serviços externos e públicos e são apresentados sem qualquer garantia de precisão, completude ou atualidade.",
            "As ferramentas são destinadas a usuários interessados em aspectos técnicos e não substituem consultas profissionais de rede, segurança ou jurídica.",
          ],
        },
        {
          heading: "3. Disponibilidade do serviço",
          paragraphs: [
            "Não há garantia de disponibilidade específica ou ininterrupta do site. A operação pode ser mantida, restringida, alterada ou encerrada permanentemente a qualquer momento, sem aviso prévio.",
            "Para impedir abuso e sobrecarga, solicitações individuais podem ser limitadas por taxa ou recusadas.",
          ],
        },
        {
          heading: "4. Uso aceitável",
          paragraphs: [
            "Você concorda em usar o site somente de acordo com a legislação aplicável. Em especial, é proibido:",
          ],
          bullets: [
            "fazer consultas automatizadas ou em massa em uma escala que prejudique a operação ou contorne os limites de taxa;",
            "usar as ferramentas para preparar ou executar ataques, acessos não autorizados ou outros atos ilícitos;",
            "informar alvos ou credenciais que você não tem autorização para testar;",
            "contornar limitações técnicas ou medidas de segurança do site;",
            "qualquer uso que infrinja direitos de terceiros ou viole a legislação aplicável.",
          ],
        },
        {
          heading: "5. Ausência de garantia dos resultados",
          paragraphs: [
            "A informação obtida é fornecida apenas para fins técnicos e informativos. Pode estar incompleta, desatualizada ou incorreta e não substitui aconselhamento profissional, jurídico ou de segurança.",
            "A avaliação e o uso dos resultados são de sua responsabilidade. Não assumimos responsabilidade por decisões tomadas com base nas informações exibidas.",
          ],
        },
        {
          heading: "6. Serviços externos e conteúdo",
          paragraphs: [
            "Para fornecer os resultados, as solicitações são enviadas a serviços externos. O respectivo provedor é responsável por seu conteúdo, disponibilidade e tratamento de dados. Os detalhes sobre os serviços incorporados podem ser encontrados na política de privacidade.",
          ],
        },
        {
          heading: "7. Responsabilidade",
          paragraphs: [
            "As ferramentas são fornecidas “como estão”, sem qualquer garantia. Na medida em que a lei permitir, fica excluída a responsabilidade por danos decorrentes do uso ou da indisponibilidade do site, ou da confiança depositada nos resultados exibidos.",
            "Isso não afeta a responsabilidade por dolo ou culpa grave, nem por danos resultantes de lesão à vida, ao corpo ou à saúde.",
          ],
        },
        {
          heading: "8. Responsabilidade por links",
          paragraphs: [
            "O site pode conter referências a sites externos de terceiros ou exibir resultados que apontam para eles. Não temos influência sobre seu conteúdo e não assumimos responsabilidade por ele. O respectivo provedor é sempre responsável pelo conteúdo das páginas vinculadas.",
          ],
        },
        {
          heading: "9. Propriedade intelectual",
          paragraphs: [
            "O design do site e o código-fonte subjacente são protegidos por direitos de propriedade intelectual ou regidos pela licença aplicável do projeto. Os dados exibidos pelas ferramentas vêm em grande parte de fontes públicas de terceiros e podem estar sujeitos aos termos de uso desses terceiros.",
          ],
        },
        {
          heading: "10. Proteção de dados",
          paragraphs: [
            "As informações sobre o tratamento de dados pessoais podem ser encontradas na política de privacidade. Ao usar o site, você reconhece o tratamento de dados descrito nela.",
          ],
        },
        {
          heading: "11. Disposições finais",
          paragraphs: [
            "Se alguma disposição destes termos for ou se tornar inválida, a validade das demais disposições não será afetada.",
            "Aplica-se a lei do local de estabelecimento do controlador, salvo disposções legais obrigatórias — por exemplo, em favor dos consumidores — que prevejam o contrário.",
          ],
        },
        {
          heading: "12. Alterações destes termos",
          paragraphs: [
            "Estes termos de uso podem ser ajustados quando necessário, por exemplo, quando os recursos ou os serviços incorporados mudarem. A versão publicada aqui prevalecerá a cada momento.",
            "Para qualquer questão, entre em contato conosco em: {email}",
          ],
        },
      ],
    },
    "pt-PT": {
      navLabel: "Condições de Utilização",
      title: "Condições de Utilização",
      subtitle:
        "As condições que regem a utilização das ferramentas aqui disponibilizadas.",
      lastUpdatedLabel: "Última atualização",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "endereço de contacto mediante pedido",
      sections: [
        {
          heading: "1. Âmbito",
          paragraphs: [
            "Estas condições de utilização aplicam-se à utilização deste sítio e das ferramentas aqui disponibilizadas para consultar informação de IP, domínio e rede. Ao utilizar o sítio, aceita estas condições.",
            "Este sítio é um projeto pessoal e não comercial, disponibilizado gratuitamente. Se não aceitar estas condições, não utilize o sítio.",
          ],
        },
        {
          heading: "2. Descrição do serviço",
          paragraphs: [
            "O sítio disponibiliza ferramentas para consultar informação publicamente disponível sobre endereços IP, domínios e redes. Alguns resultados provêm de serviços externos e públicos e são apresentados sem qualquer garantia de exatidão, integralidade ou atualidade.",
            "As ferramentas destinam-se a utilizadores interessados em questões técnicas e não substituem aconselhamento profissional de rede, segurança ou jurídico.",
          ],
        },
        {
          heading: "3. Disponibilidade do serviço",
          paragraphs: [
            "Não existe um direito a uma disponibilidade específica ou ininterrupta do sítio. A operação pode ser mantida, limitada, alterada ou descontinada permanentemente a qualquer momento, sem aviso prévio.",
            "Para impedir abuso e sobrecarga, pedidos individuais podem ser limitados ou recusados.",
          ],
        },
        {
          heading: "4. Utilização admissível",
          paragraphs: [
            "Compromete-se a utilizar o sítio apenas de acordo com a lei aplicável. Em especial, é proibido:",
          ],
          bullets: [
            "efetuar consultas automatizadas ou em massa numa escala que prejudique a operação ou contorne os limites de pedidos;",
            "utilizar as ferramentas para preparar ou executar ataques, acessos não autorizados ou outros atos ilícitos;",
            "introduzir alvos ou credenciais cuja verificação não esteja autorizada;",
            "contornar restrições técnicas ou medidas de segurança do sítio;",
            "qualquer utilização que infrinja direitos de terceiros ou viole a lei aplicável.",
          ],
        },
        {
          heading: "5. Ausência de garantia dos resultados",
          paragraphs: [
            "A informação obtida é disponibilizada apenas para fins técnicos e informativos. Pode estar incompleta, desatualizada ou incorreta e não substitui aconselhamento profissional, jurídico ou de segurança.",
            "A avaliação e utilização dos resultados são da sua responsabilidade. Não é aceite qualquer responsabilidade por decisões tomadas com base na informação apresentada.",
          ],
        },
        {
          heading: "6. Serviços externos e conteúdos",
          paragraphs: [
            "Para fornecer os resultados, os pedidos são enviados para serviços externos. O respetivo fornecedor é responsável pelos seus conteúdos, disponibilidade e tratamento de dados. Os detalhes sobre os serviços incorporados podem ser encontrados na política de privacidade.",
          ],
        },
        {
          heading: "7. Responsabilidade",
          paragraphs: [
            "As ferramentas são disponibilizadas «tal como estão», sem qualquer garantia. Na medida em que a lei o permita, é excluída a responsabilidade por danos decorrentes da utilização ou indisponibilidade do sítio ou da confiança depositada nos resultados apresentados.",
            "Isto não afeta a responsabilidade por dolo ou culpa grave, nem por danos resultantes de lesão da vida, do corpo ou da saúde.",
          ],
        },
        {
          heading: "8. Responsabilidade por ligações",
          paragraphs: [
            "O sítio pode conter referências para sítios externos de terceiros ou apresentar resultados que apontam para eles. Não temos influência sobre os seus conteúdos e não nos responsabilizamos por eles. O respetivo fornecedor é sempre responsável pelo conteúdo das páginas ligadas.",
          ],
        },
        {
          heading: "9. Propriedade intelectual",
          paragraphs: [
            "O desenho do sítio e o código-fonte subjacente estão protegidos por direitos de propriedade intelectual ou regidos pela licença aplicável do projeto. Os dados apresentados pelas ferramentas provêm em grande parte de fontes públicas de terceiros e podem estar sujeitos às respetivas condições de utilização.",
          ],
        },
        {
          heading: "10. Proteção de dados",
          paragraphs: [
            "As informações sobre o tratamento de dados pessoais podem ser encontradas na política de privacidade. Ao utilizar o sítio, reconhece o tratamento de dados descrito nessa política.",
          ],
        },
        {
          heading: "11. Disposições finais",
          paragraphs: [
            "Se alguma disposição destas condições for ou se tornar inválida, a validade das restantes disposições não será afetada.",
            "Aplica-se a lei do local de estabelecimento do responsável, salvo disposições legais imperativas — por exemplo, a favor dos consumidores — que prevejam o contrário.",
          ],
        },
        {
          heading: "12. Alterações destas condições",
          paragraphs: [
            "Estas condições de utilização podem ser ajustadas sempre que necessário, por exemplo, quando os recursos ou os serviços incorporados mudarem. Aplicar-se-á sempre a versão publicada aqui.",
            "Para qualquer questão, pode contactar-nos em: {email}",
          ],
        },
      ],
    },
    ja: {
      navLabel: "利用規約",
      title: "利用規約",
      subtitle: "本サイトで提供するツールの利用に適用される条件です。",
      lastUpdatedLabel: "最終更新日",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "お問い合わせ先の住所（請求時）",
      sections: [
        {
          heading: "1. 適用範囲",
          paragraphs: [
            "本利用規約は、IP、ドメイン、ネットワーク情報の照会のために本サイトおよび本サイトで提供するツールを利用する場合に適用されます。本サイトを利用することで、本規約に同意したものとみなされます。",
            "本サイトは、非営利の個人ホビープロジェクトであり、無料で利用できます。本規約に同意されない場合は、本サイトをご利用にならないでください。",
          ],
        },
        {
          heading: "2. サービスの内容",
          paragraphs: [
            "本サイトは、IPアドレス、ドメイン、ネットワークに関する公開情報を調べるツールを提供します。結果の一部は外部の公開サービスから得られるため、正確性、完全性、最新性についていかなる保証もなく表示されます。",
            "これらのツールは技術に関心のある利用者向けであり、専門的なネットワーク、セキュリティまたは法務上の助言に代わるものではありません。",
          ],
        },
        {
          heading: "3. サービスの利用可能性",
          paragraphs: [
            "本サイトについて、特定の利用可否または継続的な利用可能性を保証するものではありません。事前の通知なしに、保守、制限、変更、または恒久的な停止が行われることがあります。",
            "悪用と過負荷を防ぐため、個別のリクエストにはレート制限が課されるか、拒否される場合があります。",
          ],
        },
        {
          heading: "4. 許容される利用",
          paragraphs: [
            "利用者は、適用される法令を遵守して本サイトを利用することに同意します。特に、次の行為は禁止されています。",
          ],
          bullets: [
            "本サイトの運営を妨げ、またはレート制限を回避する規模での自動的または大量な照会",
            "攻撃、不正アクセスその他の違法行為を準備または実行するためのツールの利用",
            "検査する権限のない対象または認証情報を入力すること",
            "本サイトの技術的制限または安全対策を回避すること",
            "第三者の権利を侵害する、または適用される法令に違反する利用",
          ],
        },
        {
          heading: "5. 結果についての保証なし",
          paragraphs: [
            "取得される情報は、技術的および情報的目的にのみ提供されます。不完全、古い、または誤った内容を含む可能性があり、専門的、法務的またはセキュリティ上の助言に代わるものではありません。",
            "結果の評価と利用は利用者の責任です。表示された情報に基づいて利用者が行った決定について、当社は責任を負いません。",
          ],
        },
        {
          heading: "6. 外部サービスとコンテンツ",
          paragraphs: [
            "結果を提供するため、リクエストは外部サービスに送信されます。それらの内容、利用可能性、データ処理については、それぞれの提供者が責任を負います。組み込まれているサービスについては、プライバシーポリシーに詳細が記載されています。",
          ],
        },
        {
          heading: "7. 責任",
          paragraphs: [
            "本ツールは現状有姿で提供され、いかなる保証も明示的または黙示的に提供されません。法律が許容する範囲において、本サイトの利用または利用不能から生じる損害、表示された結果への信頼から生じる損害について、当社は責任を負いません。",
            "故意的または重過失に対する責任、および生命、身体または健康の侵害から生じる損害に対する責任は、本条の制限にかかわらず存続します。",
          ],
        },
        {
          heading: "8. リンクに関する責任",
          paragraphs: [
            "本サイトには、第三者の外部サイトへのリンクが含まれることがあります。また、それらのサイトを指す結果が表示されることもあります。当社はその内容に影響せず、その内容について責任を負いません。リンク先ページの内容については、常に各提供者が責任を負います。",
          ],
        },
        {
          heading: "9. 知的財産",
          paragraphs: [
            "本サイトのデザインおよび基礎となるソースコードは、知的財産権の保護を受け、または本プロジェクトの適用されるライセンスの条件に従います。ツールによって表示されるデータの多くは第三者の公開情報源に由来し、その利用条件が適用される場合があります。",
          ],
        },
        {
          heading: "10. プライバシー",
          paragraphs: [
            "個人データの取り扱いについては、プライバシーポリシーを参照してください。本サイトを利用することにより、そこで説明したデータ処理へ同意したものとみなされます。",
          ],
        },
        {
          heading: "11. 最終条項",
          paragraphs: [
            "本規約のいずれかの規定が無効または将来無効となったとしても、その他の規定の有効性には影響しません。",
            "管理者の所在地を管轄する法律が適用されますが、消費者保護などの強制的な法律が異なる場合は、その限りではありません。",
          ],
        },
        {
          heading: "12. 本規約の変更",
          paragraphs: [
            "本規約は、機能や組み込みサービスが変更された場合など、必要に応じて変更されることがあります。常に本サイトに掲載されているバージョンが適用されます。",
            "ご質問については、次の住所までご連絡ください: {email}",
          ],
        },
      ],
    },
    ko: {
      navLabel: "이용약관",
      title: "이용약관",
      subtitle: "이 사이트에서 제공하는 도구 이용에 적용되는 조건입니다.",
      lastUpdatedLabel: "마지막 업데이트",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "요청 시 제공되는 연락처",
      sections: [
        {
          heading: "1. 적용 범위",
          paragraphs: [
            "본 이용약관은 IP, 도메인 및 네트워크 정보를 조회하기 위해 이 사이트와 여기에서 제공하는 도구를 이용할 때 적용됩니다. 사이트를 이용하면 본 약관에 동의하는 것으로 간주됩니다.",
            "이 사이트는 비상업적인 개인 취미 프로젝트이며 무료로 제공됩니다. 본 약관에 동의하지 않는 경우 사이트를 이용하지 말아 주십시오.",
          ],
        },
        {
          heading: "2. 서비스 설명",
          paragraphs: [
            "이 사이트는 IP 주소, 도메인 및 네트워크에 관한 공개적으로 이용 가능한 정보를 조회하는 도구를 제공합니다. 일부 결과는 외부 공개 서비스에서 제공되며 정확성, 완전성 또는 최신성에 대한 보장 없이 표시됩니다.",
            "이 도구는 기술에 관심이 있는 사용자를 위한 도구이며 네트워크, 보안 또는 법률에 대한 전문적 조언을 대체하지 않습니다.",
          ],
        },
        {
          heading: "3. 서비스 이용 가능성",
          paragraphs: [
            "이 사이트가 특정 기간 동안 끊김 없이 제공될 권리를 보장하지 않습니다. 사전 통지 없이 언제든지 운영을 계속하거나 제한 또는 변경할 수 있으며 영구적으로 중단할 수도 있습니다.",
            "오용과 과부하를 방지하기 위해 개별 요청을 속도 제한하거나 거부할 수 있습니다.",
          ],
        },
        {
          heading: "4. 허용되는 이용",
          paragraphs: [
            "귀하는 적용되는 법률을 준수하여 사이트를 이용하는 데 동의합니다. 특히 다음 행위는 금지됩니다:",
          ],
          bullets: [
            "사이트 운영을 방해하거나 요청 속도 제한을 우회할 정도의 규모로 자동화 또는 대량 조회하는 행위",
            "공격, 무단 접근 또는 기타 불법 행위를 준비하거나 실행하기 위해 도구를 사용하는 행위",
            "조회할 권한이 없는 대상 또는 인증 정보를 입력하는 행위",
            "사이트의 기술적 제한 또는 보안 조치를 우회하는 행위",
            "제3자의 권리를 침해하거나 적용되는 법률을 위반하는 모든 이용",
          ],
        },
        {
          heading: "5. 결과에 대한 보증 없음",
          paragraphs: [
            "검색된 정보는 기술적 목적과 정보 제공 목적으로만 제공됩니다. 불완전하거나 오래되었거나 부정확할 수 있으며 전문적인 법률, 보안 또는 기술 자문을 대체하지 않습니다.",
            "결과의 평가 및 이용은 이용자의 책임입니다. 표시된 정보를 바탕으로 이용자가 내린 결정에 대해 당사는 책임을 지지 않습니다.",
          ],
        },
        {
          heading: "6. 외부 서비스 및 콘텐츠",
          paragraphs: [
            "결과를 제공하기 위해 외부 서비스로 요청이 전송됩니다. 해당 콘텐츠, 이용 가능성 및 데이터 처리에 대한 책임은 각 제공자에게 있습니다. 포함된 서비스에 대한 자세한 내용은 개인정보 보호정책에서 확인할 수 있습니다.",
          ],
        },
        {
          heading: "7. 책임",
          paragraphs: [
            "도구는 어떠한 보증도 없이 현재 상태대로 제공됩니다. 법률이 허용하는 범위에서 사이트의 이용 또는 이용 불가로 인해 발생한 손해, 표시된 결과에 의존하여 발생한 손해에 대한 책임은 제외됩니다.",
            "고의 또는 중대한 과실에 대한 책임과 생명, 신체 또는 건강의 침해로 인해 발생한 손해에 대한 책임에는 영향을 주지 않습니다.",
          ],
        },
        {
          heading: "8. 링크에 대한 책임",
          paragraphs: [
            "이 사이트에는 제3자의 외부 사이트로 연결되는 링크가 포함되거나 그러한 사이트를 가리키는 결과가 표시될 수 있습니다. 당사는 해당 콘텐츠에 영향을 미치지 않으며 그에 대한 책임을 지지 않습니다. 연결된 페이지의 콘텐츠에 대한 책임은 언제나 해당 제공자에게 있습니다.",
          ],
        },
        {
          heading: "9. 지식재산권",
          paragraphs: [
            "사이트의 디자인과 이를 바탕으로 한 소스 코드는 지식재산권으로 보호되며 프로젝트의 해당 라이선스 조건의 적용을 받습니다. 도구를 통해 표시되는 데이터는 대부분 제3자의 공개 출처에서 제공되므로 해당 이용 조건이 적용될 수 있습니다.",
          ],
        },
        {
          heading: "10. 개인정보 보호",
          paragraphs: [
            "개인정보 처리 방법은 개인정보 보호정책에서 확인할 수 있습니다. 사이트를 이용하면 그곳에 설명된 데이터 처리를 인정하는 것으로 간주됩니다.",
          ],
        },
        {
          heading: "11. 최종 조항",
          paragraphs: [
            "본 이용약관의 어떤 조항이 무효이거나 이후 무효가 되더라도 다른 조항의 유효성에는 영향을 받지 않습니다.",
            "소비자를 보호하는 등 강제적인 법률 규정이 아닌 한 관리자 소재지의 법률이 적용됩니다.",
          ],
        },
        {
          heading: "12. 약관의 변경",
          paragraphs: [
            "본 이용약관은 기능 또는 포함된 서비스가 변경되는 경우 등 필요에 따라 조정될 수 있습니다. 언제나 이 사이트에 게시된 버전이 적용됩니다.",
            "문의 사항은 {email}로 연락해 주십시오.",
          ],
        },
      ],
    },
    ru: {
      navLabel: "Условия использования",
      title: "Условия использования",
      subtitle:
        "Условия, регулирующие использование инструментов, доступных на этом сайте.",
      lastUpdatedLabel: "Последнее обновление",
      lastUpdated: "2026-06-15",
      contactNotConfigured: "контактный адрес по запросу",
      sections: [
        {
          heading: "1. Область применения",
          paragraphs: [
            "Настоящие условия использования применяются к использованию этого сайта и предоставленных здесь инструментов для получения сведений об IP-адресах, доменах и сетях. Начиная пользоваться сайтом, вы принимаете настоящие условия.",
            "Этот сайт представляет собой частный некоммерческий проект и предоставляется бесплатно. Если вы не принимаете настоящие условия, не пользуйтесь сайтом.",
          ],
        },
        {
          heading: "2. Описание сервиса",
          paragraphs: [
            "Сайт предоставляет инструменты для получения общедоступной информации об IP-адресах, доменах и сетях. Часть результатов поступает из внешних публичных сервисов и предоставляется без гарантии точности, полноты или актуальности.",
            "Инструменты предназначены для технически подготовленных пользователей и не заменяют профессиональные консультации по сетям, безопасности или правовым вопросам.",
          ],
        },
        {
          heading: "3. Доступность сервиса",
          paragraphs: [
            "Сайт не гарантирует определенную или непрерывную доступность. Его работа может быть технически поддержана, ограничена, изменена или прекращена навсегда в любой момент без предварительного уведомления.",
            "Для предотвращения злоупотреблений и перегрузки отдельные запросы могут ограничиваться по частоте или отклоняться.",
          ],
        },
        {
          heading: "4. Допустимое использование",
          paragraphs: [
            "Вы соглашаетесь использовать сайт только в соответствии с применимым законодательством. В частности, запрещается:",
          ],
          bullets: [
            "автоматизированный или массовый запрос в объеме, который нарушает работу сайта или позволяет обходить ограничения частоты;",
            "использование инструментов для подготовки или осуществления атак, несанкционированного доступа или иных незаконных действий;",
            "ввод целей или учетных данных, проверять которые вы не уполномочены;",
            "обход технических ограничений или мер безопасности сайта;",
            "любое использование, нарушающее права третьих лиц или противоречащее применимому законодательству.",
          ],
        },
        {
          heading: "5. Отсутствие гарантий по результатам",
          paragraphs: [
            "Полученная информация предоставляется только для технических и информационных целей. Она может быть неполной, устаревшей или неверной и не заменяет профессиональные консультации, в том числе юридические или по вопросам безопасности.",
            "Оценка и использование результатов являются вашей ответственностью. Мы не несем ответственности за решения, принятые на основании отображаемой информации.",
          ],
        },
        {
          heading: "6. Внешние сервисы и содержимое",
          paragraphs: [
            "Для предоставления результатов запросы направляются во внешние сервисы. Каждый соответствующий провайдер отвечает за их содержимое, доступность и обработку данных. Подробности о подключенных сервисах приведены в политике конфиденциальности.",
          ],
        },
        {
          heading: "7. Ответственность",
          paragraphs: [
            "Инструменты предоставляются «как есть», без каких-либо гарантий. В той степени, в какой это допускается законом, ответственность за убытки, возникшие в результате использования или недоступности сайта либо доверия к отображаемым результатам, исключается.",
            "Это не ограничивает ответственность за умысел и грубую неосторожность, а также за убытки, причиненные причинением вреда жизни, телу или здоровью.",
          ],
        },
        {
          heading: "8. Ответственность за ссылки",
          paragraphs: [
            "Сайт может содержать ссылки на внешние сайты третьих лиц или отображать результаты, ведущие на такие сайты. Мы не влияем на их содержимое и не несем за него ответственности. За содержимое связанных страниц всегда отвечает соответствующий провайдер.",
          ],
        },
        {
          heading: "9. Интеллектуальная собственность",
          paragraphs: [
            "Оформление сайта и лежащий в его основе исходный код защищены правами интеллектуальной собственности или регулируются соответствующей лицензией проекта. Данные, отображаемые инструментами, в основном происходят из общедоступных источников третьих лиц и могут подчиняться их условиям использования.",
          ],
        },
        {
          heading: "10. Защита данных",
          paragraphs: [
            "Информация о том, как обрабатываются персональные данные, содержится в политике конфиденциальности. Используя сайт, вы признаете описанную там обработку данных.",
          ],
        },
        {
          heading: "11. Заключительные положения",
          paragraphs: [
            "Если отдельное положение настоящих условий является или станет недействительным, действительность остальных положений не затрагивается.",
            "Применяется право государства местонахождения оператора, если этому не препятствуют обязательные законодательные положения, например положения в пользу потребителей.",
          ],
        },
        {
          heading: "12. Изменение настоящих условий",
          paragraphs: [
            "Настоящие условия использования могут быть изменены при необходимости, например, если изменятся функции или подключенные сервисы. Каждый раз применяется опубликованная здесь версия.",
            "По любым вопросам вы можете связаться с нами по адресу: {email}",
          ],
        },
      ],
    },
  },
};

export const legalEastern: Record<LegalEasternLocale, LegalContent> = {
  pl: {
    privacy: legalEasternDocuments.privacy.pl,
    terms: legalEasternDocuments.terms.pl,
  },
  "pt-BR": {
    privacy: legalEasternDocuments.privacy["pt-BR"],
    terms: legalEasternDocuments.terms["pt-BR"],
  },
  "pt-PT": {
    privacy: legalEasternDocuments.privacy["pt-PT"],
    terms: legalEasternDocuments.terms["pt-PT"],
  },
  ja: {
    privacy: legalEasternDocuments.privacy.ja,
    terms: legalEasternDocuments.terms.ja,
  },
  ko: {
    privacy: legalEasternDocuments.privacy.ko,
    terms: legalEasternDocuments.terms.ko,
  },
  ru: {
    privacy: legalEasternDocuments.privacy.ru,
    terms: legalEasternDocuments.terms.ru,
  },
};
