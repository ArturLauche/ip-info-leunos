import type { PrivacyContent } from "@/lib/privacy";
import type { TermsContent } from "@/lib/terms";

type NorthernLocale = "cs" | "sv" | "da" | "nb" | "fi" | "el" | "ro" | "tr";

type LegalContent = {
  privacy: PrivacyContent;
  terms: TermsContent;
};

const PRIVACY_LAST_UPDATED = "2026-09-02";
const TERMS_LAST_UPDATED = "2026-06-15";

const cs: LegalContent = {
  privacy: {
    navLabel: "Ochrana osobních údajů",
    title: "Zásady ochrany osobních údajů",
    subtitle: "Jak tento web nakládá s osobními údaji, zejména s IP adresami.",
    lastUpdatedLabel: "Poslední aktualizace",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "kontaktní adresa na vyžádání",
    controllerNotConfigured: "provozovatel tohoto webu (identita na vyžádání)",
    sections: [
      {
        heading: "1. Odpovědný za zpracování",
        paragraphs: [
          "Tento web je soukromý, nekomerční hobby projekt. Správcem osobních údajů ve smyslu obecného nařízení o ochraně osobních údajů (GDPR) je {controller}.",
          "Kontaktní údaje pro otázky týkající se ochrany osobních údajů: {email}",
        ],
      },
      {
        heading: "2. Zásada minimalizace dat",
        paragraphs: [
          "Tento web nepoužívá žádné sledovací soubory cookie, nástroje webové analýzy, reklamní sítě ani uživatelské účty. Nevytváří se žádné sledovací, reklamní ani trvalé uživatelské profily a osobní údaje se nezpracovávají pro marketingové účely.",
          "Při zobrazení vlastní IP adresy se z ní však průběžně odvozují síťové parametry, jako jsou přibližná poloha, poskytovatel/ASN, typ připojení a odhad použití proxy či hostingu. Slouží výhradně k okamžitému zobrazení výsledku, nejsou trvale uloženy ani spojeny do osobního profilu.",
        ],
      },
      {
        heading: "3. Údaje o přístupu a IP adresa",
        paragraphs: [
          "Při otevření webu server zpracovává technicky nezbytné údaje o přístupu, včetně vaší IP adresy. IP adresa se používá k doručení webu a krátkodobě k ochraně proti zneužití a přetížení (omezování četnosti požadavků).",
          "Omezování četnosti uchovává pouze přechodné čítače v paměti (časové okno přibližně 60 sekund). Aplikace sama nevytváří trvalou databázi protokolů s IP adresami.",
          "Právním základem je oprávněný zájem na zabezpečeném a spolehlivém provozu webu podle čl. 6 odst. 1 písm. f GDPR. Poskytovatel hostingu může vést vlastní serverové protokoly bez ohledu na uvedené.",
        ],
      },
      {
        heading: "4. Zpracování při používání nástrojů",
        paragraphs: [
          "Hlavní funkcí tohoto webu je vyhledávání informací o IP adresách, doménách a sítích. Když si zobrazíte vlastní IP adresu nebo prověříte IP adresu či doménu, příslušná IP adresa nebo doména se odešle externím veřejným službám, aby získaly požadované informace.",
          "Některé nástroje zpracovávají více než pouze IP adresu nebo doménu: při kontrole CDN se od cílového serveru vyžádá celá zadaná adresa URL včetně cesty a parametrů dotazu. Kontroly dosažitelnosti (ping/databáze) mohou při navazování připojení přenést k zadanému cíli také přihlašovací údaje, které zadáte, například uživatelské jméno a heslo. Takové údaje se použijí pouze pro příslušnou kontrolu, nejsou trvale uloženy ani předány třetím stranám mimo zadaný cíl.",
          "Právním základem je čl. 6 odst. 1 písm. f GDPR (poskytnutí funkce, kterou jste aktivně vyžádali).",
        ],
      },
      {
        heading: "5. Zapojené externí služby",
        paragraphs: [
          "Při použití jednotlivých nástrojů se odesílají požadavky následujícím službám. Některé z nich se nacházejí mimo EU/EHP, zejména ve Spojených státech. Takové předání do třetí země probíhá podle příslušných podmínek ochrany a předávání dat příslušného poskytovatele; u některých poskytovatelů může chybět rozhodnutí o odpovídající ochraně a vhodná zaručení ve smyslu čl. 46 GDPR. Podrobnosti o právním základu předání u konkrétní služby si můžete vyžádat prostřednictvím níže uvedené kontaktní adresy.",
        ],
        bullets: [
          "ip-api.com – geolokace IP a metadata sítě (na serveru).",
          "ipinfo.io – volitelné podrobnosti ASN, pokud je nakonfigurován token (na serveru).",
          "stat.ripe.net (RIPE NCC, EU) – veřejná směrovací data a data ASN (na serveru).",
          "peeringdb.com – veřejné profily sítí a peeringu (na serveru).",
          "WHOIS/RDAP – při dotazech WHOIS se zadaný cíl nejprve odešle do whois.iana.org a poté příslušnému registrovému nebo doporučovacímu serveru WHOIS; rdap.org slouží jako zdroj RDAP nebo záložní zdroj (na serveru).",
          "DNS blokovací seznamy zen.spamhaus.org (včetně SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – při kontrole pověsti se dotazovaná IP adresa přenáší na serveru prostřednictvím dotazů DNS.",
          "api.blocklist.de – navíc počet nahlášených útoků na dotazovanou IP adresu (na serveru, bez klíče API).",
          "Feodo Tracker (feodotracker.abuse.ch) a Spamhaus DROP (drop/dropv6) – datové sady pro botnet C2 a kriminální síťové bloky; tyto datové zdroje se pravidelně stahují a ukládají do mezipaměti na serveru. Dotazovaná IP adresa se při kontrolách založených na těchto zdrojích neodesílá společnosti abuse.ch ani službě Spamhaus.",
          "api.greynoise.io (Community API) – kontext skenů z celého internetu; bez ověření nebo s volitelnou bezplatnou klíčí; výsledky se na serveru ukládají do mezipaměti na 24 hodin pro každou IP adresu.",
          "api.abuseipdb.com – volitelná data o pověsti a zneužití, pokud je nakonfigurován klíč (na serveru).",
          "dnsbl.httpbl.org (Project Honey Pot) – volitelná data o zneužívání webu (harvesters, spammeři v komentářích), pokud je nakonfigurován přístupový klíč (na serveru).",
          "threatfox-api.abuse.ch – volitelné vyhledávání indikátorů hrozeb (IOC), pokud je nakonfigurován Auth-Key (na serveru).",
          "flagcdn.com – vlajky zemí. Pokud výsledek obsahuje zemi, příslušný kód země se na serveru předá vlastní proxy službě flagcdn.com (vaše IP adresa se přitom neposílá); obrázek vlajky se ukládá do mezipaměti na serveru.",
          "Rekurzivní DNS resolver – při kontrolách založených na doménách se zadaný hostname řeší pomocí DNS resolveru nastaveného poskytovatelem hostingu nebo systémem; tento resolver (případně provozovaný poskytovatelem hostingu) přijímá dotazovaný hostname.",
          "api64.ipify.org a checkip.amazonaws.com – zjištění vlastní IP adresy přímo v prohlížeči; vaše IP adresa se přímo předá těmto službám.",
        ],
      },
      {
        heading: "6. Místní úložiště (motiv)",
        paragraphs: [
          "Vaše předvolba motivu (světlý/tmavý/systémový) je uložena v místním úložišti (localStorage) prohlížeče. Jde o technicky funkční uložení, které slouží pouze k zachování vaší předvolby a neodesílá žádná data serveru ani třetím stranám. Nevyžaduje souhlas.",
        ],
      },
      {
        heading: "7. Soubory cookie",
        paragraphs: [
          "Tento web nenastavuje žádné soubory cookie vyžadující souhlas ani sledovací či reklamní soubory cookie a nepoužívá obdobné techniky k rozpoznávání vás napříč zařízeními. Ukládá se pouze technicky nezbytná předvolba motivu popsaná v části „Místní úložiště (motiv)“ v místním úložišti prohlížeče.",
          "Protože se nepoužívají žádné soubory cookie ani sledovací nástroje vyžadující souhlas, není pro tento web nutný banner pro soubory cookie.",
        ],
      },
      {
        heading: "8. Bezpečnost údajů",
        paragraphs: [
          "Web je dostupný přes šifrované HTTPS (TLS), aby byla přenosová data chráněna před neoprávněným přístupem a manipulací. Kromě toho jsou v rámci možností tohoto hobby projektu přijímána přiměřená technická a organizační opatření k ochraně zpracovávaných údajů před ztrátou, zneužitím a neoprávněným přístupem.",
          "Úplnou ochranu při přenosu po internetu však podle současného stavu techniky nelze zaručit.",
        ],
      },
      {
        heading: "9. Kontakt",
        paragraphs: [
          "Pokud nás kontaktujete na uvedené adrese, zpracováváme údaje, které sdělíte, například e-mailovou adresu a obsah zprávy, výhradně ke zpracování vašeho požadavku. Právním základem je náš oprávněný zájem na odpovídání na dotazy podle čl. 6 odst. 1 písm. f GDPR.",
          "Údaje vymažeme, jakmile již nebudou potřebné k vyřízení požadavku a nebude-li nutné je ze zákona uchovat.",
        ],
      },
      {
        heading: "10. Doba uchovávání",
        paragraphs: [
          "Aplikace trvale neuchovává údaje o požadavcích. Po uplynutí časového okna (přibližně 60 sekund) vyprší platnost čítačů pro omezování četnosti; příslušný záznam je fyzicky odstraněn z paměti při pozdějším úklidu vyvolaném dalšími požadavky. Pokud žádný další provoz nedojde, může již vypršelý záznam zůstat v paměti až do dalšího úklidu nebo restartu procesu. K trvalému ukládání ani ukládání, z něhož by bylo možné osoby identifikovat, nedochází.",
          "Údaje předané externím službám podléhají příslušným zásadám ochrany soukromí těchto poskytovatelů.",
        ],
      },
      {
        heading: "11. Žádné automatizované rozhodování",
        paragraphs: [
          "Neprobíhá žádné výhradně automatizované rozhodování včetně profilování ve smyslu čl. 22 GDPR. Hodnocení zobrazovaná nástroji, například typ připojení nebo použití proxy/hostingu, slouží pouze k vašemu bezprostřednímu informování a nemají vůči vám právní účinek.",
        ],
      },
      {
        heading: "12. Vaše práva",
        paragraphs: [
          "V mezích zákonných podmínek máte právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování, přenositelnost údajů a právo vznést námitku proti zpracování založenému na oprávněných zájmech.",
          "Protože se zpracování provádí na základě oprávněných zájmů, máte také právo kdykoli z důvodů plynoucích z vaší zvláštní situace vznést námitku proti takovému zpracování (čl. 21 GDPR).",
          "Kromě toho můžete podat stížnost u orgánu dozoru pro ochranu osobních údajů. V případě jakéhokoli požadavku nás můžete kontaktovat na: {email}",
        ],
      },
      {
        heading: "13. Změny této zásady",
        paragraphs: [
          "Tuto zásadu ochrany osobních údajů podle potřeby aktualizujeme, například když se změní funkce nebo začleněné služby. Vždy se používá zde zveřejněná verze.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Podmínky používání",
    title: "Podmínky používání",
    subtitle: "Podmínky používání zde nabízených nástrojů.",
    lastUpdatedLabel: "Poslední aktualizace",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "kontaktní adresa na vyžádání",
    sections: [
      {
        heading: "1. Rozsah platnosti",
        paragraphs: [
          "Tyto podmínky používání se vztahují na používání tohoto webu a zde nabízených nástrojů pro vyhledávání informací o IP adresách, doménách a sítích. Používáním webu přijímáte tyto podmínky.",
          "Tento web je soukromý, nekomerční hobby projekt a je poskytován bezplatně. Pokud s těmito podmínkami nesouhlasíte, nepoužívejte web.",
        ],
      },
      {
        heading: "2. Popis služby",
        paragraphs: [
          "Web poskytuje nástroje pro vyhledávání veřejně dostupných informací o IP adresách, doménách a sítích. Některé výsledky pocházejí z externích veřejných služeb a jsou uváděny bez jakékoli záruky přesnosti, úplnosti či aktuálnosti.",
          "Nástroje jsou určeny technicky zainteresovaným uživatelům a nenahrazují odborné poradenství v oblasti sítí, bezpečnosti ani práva.",
        ],
      },
      {
        heading: "3. Dostupnost služby",
        paragraphs: [
          "Na konkrétní ani nepřetržitou dostupnost webu nemáte nárok. Provoz lze kdykoli bez předchozího upozornění dále udržovat, omezit, změnit nebo trvale ukončit.",
          "K ochraně proti zneužití a přetížení mohou být jednotlivé požadavky omezeny podle četnosti nebo odmítnuty.",
        ],
      },
      {
        heading: "4. Přípustné používání",
        paragraphs: [
          "Využívání webu je povoleno pouze v souladu s platnými zákony. Zejména je zakázáno:",
        ],
        bullets: [
          "provádět automatizované nebo hromadné dotazy v rozsahu, který naruší provoz nebo obejde limity četnosti;",
          "používat nástroje k přípravě či provádění útoků, neoprávněného přístupu či jiných protiprávních jednání;",
          "zadávat cíle nebo přihlašovací údaje, ke kterým nemáte oprávnění provést test;",
          "obejít technická omezení nebo bezpečnostní opatření webu;",
          "používat web jakýmkoli způsobem, který narušuje práva třetích stran nebo porušuje platné právo.",
        ],
      },
      {
        heading: "5. Bez záruky za výsledky",
        paragraphs: [
          "Načtené informace slouží pouze technickým a informačním účelům. Mohou být neúplné, zastaralé nebo nesprávné a nenahrazují odborné, právní ani bezpečnostní poradenství.",
          "Posouzení a použití výsledků je vaší vlastní odpovědností. Za rozhodnutí přijatá na základě zobrazených informací neneseme odpovědnost.",
        ],
      },
      {
        heading: "6. Externí služby a obsah",
        paragraphs: [
          "K poskytnutí výsledků se odesílají požadavky externím službám. Za jejich obsah, dostupnost a zpracování dat odpovídá příslušný poskytovatel. Podrobnosti o začleněných službách najdete v zásadě ochrany osobních údajů.",
        ],
      },
      {
        heading: "7. Odpovědnost za škody",
        paragraphs: [
          "Nástroje jsou poskytovány „tak, jak jsou“, bez jakékoli záruky. V rozsahu povoleném zákonem je vyloučena odpovědnost za škody vzniklé používáním či nedostupností webu nebo důvěrou v zobrazené výsledky.",
          "Tím nejsou dotčena odpovědnost za úmysl a hrubou nedbalost ani odpovědnost za škody vzniklé poškozením života, těla nebo zdraví.",
        ],
      },
      {
        heading: "8. Odpovědnost za odkazy",
        paragraphs: [
          "Web může obsahovat odkazy na externí webové stránky třetích stran nebo zobrazovat výsledky, které na ně odkazují. Na jejich obsah nemáme vliv ani za něj nenese odpovědnost. Za obsah propojených stránek vždy odpovídá příslušný poskytovatel.",
        ],
      },
      {
        heading: "9. Duševní vlastnictví",
        paragraphs: [
          "Grafické zpracování webu a související zdrojový kód chrání práva k duševnímu vlastnictví nebo se řídí příslušnou licencí projektu. Data zobrazená pomocí nástrojů pocházejí převážně z veřejných zdrojů třetích stran a mohou podléhat jejich podmínkám používání.",
        ],
      },
      {
        heading: "10. Ochrana osobních údajů",
        paragraphs: [
          "Informace o zacházení s osobními údaji najdete v zásadě ochrany osobních údajů. Používáním webu berete na vědomí zde popsané zpracování údajů.",
        ],
      },
      {
        heading: "11. Závěrečná ustanovení",
        paragraphs: [
          "Pokud by některá ustanovení těchto podmínek byla neplatná nebo se neplatnou stala, platnost ostatních ustanovení tím není dotčena.",
          "Platí právo státu sídla provozovatele, pokud mu nebrání závazné zákonné předpisy, například ve prospěch spotřebitelů.",
        ],
      },
      {
        heading: "12. Změny těchto podmínek",
        paragraphs: [
          "Tyto podmínky používání lze podle potřeby upravit, například když se změní funkce nebo začleněné služby. Vždy se používá zde zveřejněná verze.",
          "V případě jakýchkoli dotazů nás kontaktujte na: {email}",
        ],
      },
    ],
  },
};

const sv: LegalContent = {
  privacy: {
    navLabel: "Integritet",
    title: "Integritetspolicy",
    subtitle:
      "Så här hanterar den här webbplatsen personuppgifter, i synnerhet IP-adresser.",
    lastUpdatedLabel: "Senast uppdaterad",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "kontaktadress på begäran",
    controllerNotConfigured:
      "webbplatsens driftsansvarige (identitet på begäran)",
    sections: [
      {
        heading: "1. Ansvarig för behandlingen",
        paragraphs: [
          "Den här webbplatsen är ett privat, icke-kommersiellt hobbyprojekt. Personuppgiftsansvarig enligt dataskyddsförordningen (GDPR) är {controller}.",
          "Kontaktuppgifter för dataskyddsfrågor: {email}",
        ],
      },
      {
        heading: "2. Dataminimering",
        paragraphs: [
          "Den här webbplatsen använder inga spårningskakor, verktyg för webbanalys, annonsnätverk eller användarkonton. Inga spårnings-, annons- eller beständiga användarprofiler skapas, och inga personuppgifter behandlas för marknadsföringsändamål.",
          "När din egen IP-adress visas härleds dock nätverksattribut direkt från den, till exempel ungefärlig plats, leverantör/ASN, anslutningstyp och en bedömning av proxy/hosting. Detta används endast för att visa resultatet omedelbart och lagras inte permanent eller kombineras till en personprofil.",
        ],
      },
      {
        heading: "3. Åtkomstdata och IP-adress",
        paragraphs: [
          "När du öppnar webbplatsen behandlar servern tekniskt nödvändig åtkomstdata, bland annat din IP-adress. IP-adressen används för att leverera webbplatsen och under kort tid för att förhindra missbruk och överbelastning (hastighetsbegränsning).",
          "Hastighetsbegränsningen sparar endast tillfälliga räknare i minnet (ett tidsfönster på cirka 60 sekunder). Appen skapar inte någon permanent loggdatabase med IP-adresser i sig.",
          "Den rättsliga grunden är det berättigade intresset av att driva webbplatsen säkert och tillförlitligt enligt art. 6.1.f GDPR. Oberoende av detta kan hostingleverantören föra egna serverloggar.",
        ],
      },
      {
        heading: "4. Behandling när verktygen används",
        paragraphs: [
          "Webbplatsens kärnfunktion är att slå upp information om IP-adresser, domäner och nätverk. När du visar din egen IP-adress eller kontrollerar en IP-adress eller domän skickas den aktuella IP-adressen eller domänen till externa offentliga tjänster för att hämta den begärda informationen.",
          "Vissa verktyg behandlar mer än en IP-adress eller domän: vid CDN-kontrollen begärs hela URL-adressen du anger, inklusive sökväg och frågeparametrar, från målet. Kontrollerna av nåbarhet (ping/databas) kan som del av anslutningen överföra uppgifter du anger, till exempel användarnamn och lösenord, till målet du har angett. Sådana uppgifter används endast för den aktuella kontrollen, lagras inte permanent och delas inte med tredje part utöver det angivna målet.",
          "Den rättsliga grunden är art. 6.1.f GDPR (att tillhandahålla den funktion du aktivt har begärt).",
        ],
      },
      {
        heading: "5. Inbäddade externa tjänster",
        paragraphs: [
          "Beroende på vilket verktyg som används skickas förfrågningar till följande tjänster. Vissa av dessa finns utanför EU/EEA, i synnerhet i USA. En sådan överföring till ett tredjeland sker enligt respektive leverantörs dataskydds- och överföringsvillkor; för vissa leverantörer kan det saknas ett beslut om adekvat skydd och lämpliga garantier enligt artikel 46 GDPR. Du kan begära närmare uppgifter om överföringsgrunden för en viss tjänst via kontaktadressen nedan.",
        ],
        bullets: [
          "ip-api.com – geolokalisering av IP och nätverksmetadata (på servern).",
          "ipinfo.io – valfria ASN-detaljer om en token är konfigurerad (på servern).",
          "stat.ripe.net (RIPE NCC, EU) – offentlig routing- och ASN-data (på servern).",
          "peeringdb.com – offentliga nätverks- och peeringprofiler (på servern).",
          "WHOIS/RDAP – vid WHOIS-sökningar skickas det angivna målet först till whois.iana.org och sedan till relevant registrerings- eller hänvisnings-WHOIS-server; rdap.org används som RDAP- eller reservkälla (på servern).",
          "DNS-blocklistor: zen.spamhaus.org (inklusive SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – vid rykteskontroller skickas den kontrollerade IP-adressen på servern via DNS-förfrågningar.",
          "api.blocklist.de – även antalet rapporterade attacker mot den kontrollerade IP-adressen (på servern, utan API-nyckel).",
          "Feodo Tracker (feodotracker.abuse.ch) och Spamhaus DROP (drop/dropv6) – data om botnet-C2 och kriminella nätblock; dessa datakällor laddas ned och cachas regelbundet på servern. Den kontrollerade IP-adressen skickas inte till abuse.ch eller Spamhaus för kontroller som bygger på dessa källor.",
          "api.greynoise.io (Community API) – kontext för skannar från hela internet; utan autentisering eller med en valfri gratisnyckel; resultat cachelagras på servern per IP-adresse i 24 timmar.",
          "api.abuseipdb.com – valfria ryktes- och missbruksdata om en nyckel har konfigurerats (på servern).",
          "dnsbl.httpbl.org (Project Honey Pot) – valfria data om webbmissbruk (skördare, kommentarspammare) om en åtkomstnyckel har konfigurerats (på servern).",
          "threatfox-api.abuse.ch – valfria sökningar efter hotindikatorer (IOC) om en Auth-Key har konfigurerats (på servern).",
          "flagcdn.com – landmärken. När ett resultat innehåller ett land vidarebefordras motsvarande landkod på servern via en egen proxy till flagcdn.com (din IP-adress skickas inte vidare); flaggans bild cachelagras på servern.",
          "Rekursiv DNS-resolver – vid domänbaserade kontroller löses det angivna värdnamnet med den DNS-resolver som konfigurerats av hosting- eller systemmiljön; den resolvern (som ibland drivs av hostingleverantören) tar emot det efterfrågade värdnamnet.",
          "api64.ipify.org och checkip.amazonaws.com – identifierar din egen IP-adress direkt i webbläsaren; din IP-adress skickas direkt till dessa tjänster.",
        ],
      },
      {
        heading: "6. Lokal lagring (tema)",
        paragraphs: [
          "Inställningen för tema (ljust/mörkt/system) lagras som ett värde i webbläsarens lokala lagring (localStorage). Detta är tekniskt funktionellt, används endast för att spara din inställning och överför inga data till servern eller tredje part. Inget samtycke krävs.",
        ],
      },
      {
        heading: "7. Kakor",
        paragraphs: [
          "Webbplatsen sätter inga samtyckes-, spårnings- eller annonskakor och använder inga jämförbara tekniker för att känna igen dig mellan enheter. Endast den tekniskt nödvändiga lagringen av din temainställning som beskrivs under ”Lokal lagring (tema)” sker, i webbläsarens lokala lagring.",
          "Eftersom inga kakor eller spårare som kräver samtycke används behövs ingen cookie-banner för den här webbplatsen.",
        ],
      },
      {
        heading: "8. Datasäkerhet",
        paragraphs: [
          "Webbplatsen levereras över krypterad HTTPS (TLS) för att skydda överföringen mot obehörig åtkomst och manipulation. Därutöver vidtas inom ramen för hobbyprojektets möjligheter lämpliga tekniska och organisatoriska åtgärder för att skydda behandlade data mot förlust, missbruk och obehörig åtkomst.",
          "Fullständigt skydd vid överföring över internet kan dock inte garanteras med dagens tekniska utveckling.",
        ],
      },
      {
        heading: "9. Kontakta oss",
        paragraphs: [
          "Om du kontaktar oss på den angivna adressen behandlar vi de uppgifter du delar med oss, till exempel din e-postadress och meddelandets innehåll, enbart för att hantera ditt ärende. Den rättsliga grunden är vårt berättigade intresse av att besvara förfrågningar enligt art. 6.1.f GDPR.",
          "Uppgifterna raderas så snart de inte längre behövs för att hantera ärendet och inga lagstadgade krav på arkivering föreligger.",
        ],
      },
      {
        heading: "10. Lagringstid",
        paragraphs: [
          "Applikationen lagrar inte förfrågningsdata permanent. Räknare för hastighetsbegränsning upphör att gälla när tidsfönstret löper ut (cirka 60 sekunder); posten tas faktiskt bort från minnet vid en senare upprensning som utlöses av kommande förfrågningar. Om ingen ytterligare trafik kommer kan en redan utgången post ligga kvar i minnet till nästa upprensning eller tills processen startas om. Ingen permanent lagring eller lagring som kan utvärderas personligen sker.",
          "Data som skickas till externa tjänster omfattas av respektive leverantörs integritetspolicies.",
        ],
      },
      {
        heading: "11. Inget automatiserat beslutsfattande",
        paragraphs: [
          "Det sker inget enbart automatiserat beslutsfattande, inklusive profilering, enligt artikel 22 GDPR. De bedömningar som verktygen visar, till exempel om anslutningstyp eller användning av proxy/hosting, är endast avsedda att informera dig direkt och har ingen rättslig verkan gentemot dig.",
        ],
      },
      {
        heading: "12. Dina rättigheter",
        paragraphs: [
          "Med förbehåll för de lagstadgade förutsättningarna har du rätt till tillgång, rättelse, radering, begränsning av behandlingen, dataportabilitet och att invända mot behandling som baseras på berättigade intressen.",
          "Eftersom behandlingen baseras på berättigade intressen har du dessutom rätt att när som helst, av skäl som sammanhänger med din särskilda situation, invända mot den behandlingen (art. 21 GDPR).",
          "Du har också rätt att lämna in ett klagomål till en dataskyddstillsynsmyndighet. För alla frågor kan du nå oss på: {email}",
        ],
      },
      {
        heading: "13. Ändringar av denna policy",
        paragraphs: [
          "Denna integritetspolicy uppdateras vid behov, till exempel när funktioner eller inbäddade tjänster ändras. Den version som publiceras här gäller varje gång.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Användarvillkor",
    title: "Användarvillkor",
    subtitle: "Villkoren som styr din användning av verktygen här.",
    lastUpdatedLabel: "Senast uppdaterad",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "kontaktadress på begäran",
    sections: [
      {
        heading: "1. Tillämpningsområde",
        paragraphs: [
          "Dessa användarvillkor gäller när du använder den här webbplatsen och de verktyg som erbjuds här för att slå upp information om IP, domäner och nätverk. Genom att använda webbplatsen godkänner du dessa villkor.",
          "Den här webbplatsen är ett privat, icke-kommersiellt hobbyprojekt som tillhandahålls kostnadsfritt. Om du inte godkänner villkoren bör du inte använda webbplatsen.",
        ],
      },
      {
        heading: "2. Tjänstebeskrivning",
        paragraphs: [
          "Webbplatsen erbjuder verktyg för att slå upp offentligt tillgänglig information om IP-adresser, domäner och nätverk. Vissa resultat kommer från externa offentliga tjänster och återges utan någon garanti för riktighet, fullständighet eller aktualitet.",
          "Verktygen är avsedda för teknikintresserade användare och ersätter inte professionell rådgivning om nätverk, säkerhet eller rätt.",
        ],
      },
      {
        heading: "3. Tillgänglighet för tjänsten",
        paragraphs: [
          "Det finns ingen rätt till viss eller oavbruten tillgänglighet för webbplatsen. Driften kan när som helst, utan förvarning, underhållas, begränsas, ändras eller upphöra permanent.",
          "För att förhindra missbruk och överbelastning kan enskilda förfrågningar vara hastighetsbegränsade eller nekas.",
        ],
      },
      {
        heading: "4. Acceptabel användning",
        paragraphs: [
          "Du förbinder dig att använda webbplatsen endast i enlighet med tillämplig lag. Följande är särskilt förbjudet:",
        ],
        bullets: [
          "att göra automatiserade eller massviska förfrågningar i en omfattning som försämrar driften eller kringgår hastighetsgränserna;",
          "att använda verktygen för att förbereda eller genomföra attacker, obehörig åtkomst eller andra olagliga åtgärder;",
          "att ange mål eller uppgifter som du inte är behörig att testa;",
          "att kringgå webbplatsens tekniska begränsningar eller säkerhetsåtgärder;",
          "att använda webbplatsen på något sätt som kränker tredje parts rättigheter eller bryter mot gällande lag.",
        ],
      },
      {
        heading: "5. Ingen garanti för resultaten",
        paragraphs: [
          "Den hämtade informationen tillhandahålls endast för tekniska och informationsändamål. Den kan vara ofullständig, föråldrad eller felaktig och ersätter inte yrkeskunnig, juridisk eller säkerhetsrelaterad rådgivning.",
          "Att bedöma och använda resultaten sker på ditt eget ansvar. Vi ansvarar inte för beslut som du fattar baserat på den visade informationen.",
        ],
      },
      {
        heading: "6. Externa tjänster och innehåll",
        paragraphs: [
          "För att tillhandahålla resultat skickas förfrågningar till externa tjänster. Respektive leverantör ansvarar för deras innehåll, tillgänglighet och databehandling. Information om de inbäddade tjänsterna finns i integritetspolicyn.",
        ],
      },
      {
        heading: "7. Ansvar",
        paragraphs: [
          "Verktygen tillhandahålls ”i befintligt skick”, utan några garantier. I den utsträckning det tillåts enligt lag ansvarar vi inte för skador som uppstår genom användning av webbplatsen, dess otillgänglighet eller genom förtroende för de visade resultaten.",
          "Det påverkar inte ansvaret för uppsåt och grov vårdslöshet eller ansvaret för skador till följd av skada på liv, kropp eller hälsa.",
        ],
      },
      {
        heading: "8. Ansvar för länkar",
        paragraphs: [
          "Webbplatsen kan innehålla hänvisningar till externa webbplatser från tredje part eller visa resultat som pekar på dem. Vi har inget inflytande på deras innehåll och tar inget ansvar för det. Respektive leverantör ansvarar alltid för innehållet på de länkade sidorna.",
        ],
      },
      {
        heading: "9. Immateriella rättigheter",
        paragraphs: [
          "Webbplatsens utformning och underliggande källkod skyddas av immaterialrättsliga regler eller regleras av projektets respektive licens. Data som visas via verktygen kommer huvudsakligen från offentliga källor från tredje part och kan omfattas av deras användarvillkor.",
        ],
      },
      {
        heading: "10. Dataskydd",
        paragraphs: [
          "Information om hur personuppgifter behandlas finns i integritetspolicyn. Genom att använda webbplatsen bekräftar du den databehandling som beskrivs där.",
        ],
      },
      {
        heading: "11. Slutbestämmelser",
        paragraphs: [
          "Om någon bestämmelse i dessa användarvillkor är eller blir ogiltig påverkar det inte de övriga bestämmelsernas giltighet.",
          "Den lag som gäller i det land där den ansvarige har sitt säte tillämpas, om inte tvingande lagbestämmelser, till exempel till förmån för konsumenter, hindrar detta.",
        ],
      },
      {
        heading: "12. Ändringar av dessa villkor",
        paragraphs: [
          "Dessa användarvillkor kan justeras vid behov, till exempel när funktioner eller inbäddade tjänster ändras. Den version som publiceras här gäller varje gång.",
          "För frågor kan du nå oss på: {email}",
        ],
      },
    ],
  },
};

const da: LegalContent = {
  privacy: {
    navLabel: "Privatliv",
    title: "Privatlivspolitik",
    subtitle:
      "Sådan behandler dette websted personoplysninger, især IP-adresser.",
    lastUpdatedLabel: "Sidst opdateret",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "kontaktadresse på anmodning",
    controllerNotConfigured:
      "udbyderen af dette websted (identitet på anmodning)",
    sections: [
      {
        heading: "1. Den dataansvarlige",
        paragraphs: [
          "Dette websted er et privat, ikke-kommercielt hobbyprojekt. Den dataansvarlige i henhold til databeskyttelsesforordningen (GDPR) er {controller}.",
          "Kontaktoplysninger om databeskyttelse: {email}",
        ],
      },
      {
        heading: "2. Dataminimering",
        paragraphs: [
          "Dette websted bruger ikke sporingscookies, webanalyseredskaber, annonce-netværk eller brugerkonti. Der opbygges ingen sporings-, annonce- eller permanente brugerprofiler, og ingen personoplysninger behandles til marketingformål.",
          "Når du får vist din egen IP-adresse, udledes der imidlertid netværksattributter direkte fra den, såsom omtrentlig placering, udbyder/ASN, forbindelsestype og en vurdering af proxy/hosting. Det bruges kun til straks at vise resultatet og gemmes ikke permanent eller kombineres til en personprofil.",
        ],
      },
      {
        heading: "3. Adgangshandlinger og IP-adresse",
        paragraphs: [
          "Når du åbner webstedet, behandler serveren teknisk nødvendige adgangsdata, herunder din IP-adresse. IP-adressen bruges til at levere webstedet og kortvarigt til at forhindre misbrug og overbelastning (hastighedsbegrænsning).",
          "Hastighetsbegrænsningen opbevarer kun midlertidige tællere i hukommelsen (et tidsvindue på cirka 60 sekunder). Applikationen opretter ikke selv en permanent logdatabase med IP-adresser.",
          "Det retlige grundlag er den berettigede interesse i at drive webstedet sikkert og stabilt i henhold til GDPR artikel 6, stk. 1, lit. f. Uafhængigt heraf kan hostingudbyderen føre sine egne serverlogfiler.",
        ],
      },
      {
        heading: "4. Behandling ved brug af værktøjerne",
        paragraphs: [
          "Webstedets hovedfunktion er at slå op oplysninger om IP-adresser, domæner og netværk. Når du viser din egen IP-adresse eller kontrollerer en IP-adresse eller et domæne, sendes den pågældende IP-adresse eller det pågældende domæne til eksterne offentlige tjenester for at hente de ønskede oplysninger.",
          "Nogle værktøjer behandler mere end blot en IP-adresse eller et domæne: Ved CDN-kontrol sendes hele den indtastede URL, inklusive sti og forespørgselsparametre, til målet. Tilgængelighedskontroller (ping/database) kan som en del af oprettelsen af forbindelsen overføre indtastede oplysninger, såsom brugernavn og adgangskode, til det angivne mål. Sådanne input bruges kun til den pågældende kontrol, gemmes ikke permanent og deles ikke med tredjeparter ud over det angivne mål.",
          "Det retlige grundlag er GDPR artikel 6, stk. 1, lit. f. (tilvejebringelse af den funktion, du aktivt har anmodet om).",
        ],
      },
      {
        heading: "5. Indlejrede eksterne tjenester",
        paragraphs: [
          "Afhængigt af det anvendte værktøj sendes anmodninger til følgende tjenester. Nogle af disse tjenester ligger uden for EU/EØS, især i USA. En sådan overførsel til et tredjeland sker på grundlag af den enkelte udbyderes regler om databeskyttelse og overførsel; for visse udbydere kan der mangle en afgørelse om tilstrækkeligt beskyttelsesnivå og passende garantier i henhold til GDPR artikel 46. Du kan anmode om yderligere oplysninger om overførselgrundlaget for en bestemt tjeneste via kontaktadressen nedenfor.",
        ],
        bullets: [
          "ip-api.com – IP-geoplacering og netværksmetadata (på serveren).",
          "ipinfo.io – valgfrie ASN-oplysninger, hvis der er konfigureret en token (på serveren).",
          "stat.ripe.net (RIPE NCC, EU) – offentlige routing- og ASN-data (på serveren).",
          "peeringdb.com – offentlige netværks- og peeringprofiler (på serveren).",
          "WHOIS/RDAP – ved WHOIS-opslag sendes det indtastede mål først til whois.iana.org og derefter til den relevante registre- eller henvisnings-WHOIS-server; rdap.org fungerer som RDAP- eller reservesource (på serveren).",
          "DNS-blokeringslister: zen.spamhaus.org (herunder SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – ved kontrol af omdømme overføres den forespurgte IP-adresse på serveren via DNS-forespørgsler.",
          "api.blocklist.de – desuden antallet af rapporterede angreb mod den forespurgte IP-adresse (på serveren, uden API-nøgle).",
          "Feodo Tracker (feodotracker.abuse.ch) og Spamhaus DROP (drop/dropv6) – data om botnet-C2 og kriminelle netblokke; disse datakilder hentes og caches regelmæssigt på serveren. Den forespurgte IP-adresse overføres ikke til abuse.ch eller Spamhaus ved kontroller, der er baseret på disse kilder.",
          "api.greynoise.io (Community API) – kontekst for scanninger på tværs af internettet; uden godkendelse eller med en valgfri gratisnøgle; resultater caches på serveren pr. IP-adresse i 24 timer.",
          "api.abuseipdb.com – valgfri data om omdømme og misbrug, hvis der er konfigureret en nøgle (på serveren).",
          "dnsbl.httpbl.org (Project Honey Pot) – valgfri data om webmisbrug (harvesters, kommentar-spammere), hvis der er konfigureret en adgangsnøgle (på serveren).",
          "threatfox-api.abuse.ch – valgfrie opslag efter trusselsindikatorer (IOC), hvis der er konfigureret en Auth-Key (på serveren).",
          "flagcdn.com – landsflag. Når et resultat indeholder et land, videresendes den tilhørende landekode på serveren via en egen proxy til flagcdn.com (din IP-adresse videregives ikke i processen); flagbilledet caches på serveren.",
          "Rekursiv DNS-resolver – ved domænebaserede kontroller opløses det indtastede værtsnavn via den DNS-resolver, der er konfigureret af hostingudbyderen eller systemet; denne resolver (som eventuelt drives af hostingudbyderen) modtager det forespurgte værtsnavn.",
          "api64.ipify.org og checkip.amazonaws.com – finder din egen IP-adresse direkte i browseren; din IP-adresse sendes direkte til disse tjenester.",
        ],
      },
      {
        heading: "6. Lokal lagring (tema)",
        paragraphs: [
          "Din temaindstilling (lyst/mørkt/system) gemmes som en værdi i browserens lokale lagring (localStorage). Dette er teknisk funktionelt, bruges kun til at bevare din indstilling og overfører ingen data til serveren eller tredjeparter. Der kræves ikke samtyk hertil.",
        ],
      },
      {
        heading: "7. Cookies",
        paragraphs: [
          "Dette websted sætter ingen samtykkes-, sporings- eller annoncecookies og bruger ingen tilsvarende teknikker til at genkende dig på tværs af enheder. Der gemmes kun din temaindstilling i browserens lokale lagring, som det er teknisk nødvendigt og beskrevet under ”Lokal lagring (tema)”.",
          "Fordi der ikke bruges cookies eller trackere, der kræver samtyk, er der ikke behov for en cookie-banner på dette websted.",
        ],
      },
      {
        heading: "8. Datasikkerhed",
        paragraphs: [
          "Webstedet leveres over krypteret HTTPS (TLS) for at beskytte overførslen mod uvedkommende adgang og manipulation. Derudover træffes der i hobbyprojektets omfang passende tekniske og organisatoriske foranstaltninger for at beskytte de behandlede data mod tab, misbrug og uvedkommende adgang.",
          "Fuldstændig beskyttelse ved overførsel via internettet kan imidlertid ikke garanteres med det nuværende tekniske niveau.",
        ],
      },
      {
        heading: "9. Kontakt til os",
        paragraphs: [
          "Hvis du kontakter os på den angivne adresse, behandler vi de oplysninger, du giver os, såsom din e-mailadresse og beskedens indhold, alene med henblik på at behandle din henvendelse. Det retlige grundlag er vores berettigede interesse i at besvare forespørgsler i henhold til GDPR artikel 6, stk. 1, lit. f.",
          "Oplysningerne slettes, så snart de ikke længere er nødvendige til behandlingen, og der ikke gælder lovbestemte opbevaringspligter.",
        ],
      },
      {
        heading: "10. Opbevaringsperiode",
        paragraphs: [
          "Applikationen gemmer ikke anmodningsdata permanent. Tællere til hastighedsbegrænsning udløber, når tidsvinduet er gået (cirka 60 sekunder); den tilhørende post fjernes faktisk fra hukommelsen ved en senere oprydning, som udløses af efterfølgende anmodninger. Hvis der ikke kommer mere trafik, kan en allerede udløbet post blive i hukommelsen indtil næste oprydning eller genstart af processen. Der sker ingen permanent opbevaring eller opbevaring, der kan evalueres personligt.",
          "Data, der overføres til eksterne tjenester, er underlagt de respektive udbyderes privatlivspolitikker.",
        ],
      },
      {
        heading: "11. Ingen automatiseret beslutningstagning",
        paragraphs: [
          "Der foretages ingen udelukkende automatiseret beslutningstagning, herunder profilering, i henhold til GDPR artikel 22. Vurderinger, som værktøjerne viser, for eksempel om forbindelsestype eller brug af proxy/hosting, har kun til formål at informere dig direkte og har ingen retslig virkning over for dig.",
        ],
      },
      {
        heading: "12. Dine rettigheder",
        paragraphs: [
          "Når de lovbestemte betingelser er opfyldt, har du ret til indsigt, berigtigelse, sletning, begrænsning af behandlingen, dataportabilitet og til at gøre indsigelse mod behandling på grundlag af berettigede interesser.",
          "Da behandlingen sker på grundlag af berettigede interesser, har du også til enhver tid ret til af grunde, der vedrører din særlige situation, at gøre indsigelse mod denne behandling (GDPR artikel 21).",
          "Du har også ret til at klage til en datatilsynsmyndighed. Du kan kontakte os om alle henvendelser på: {email}",
        ],
      },
      {
        heading: "13. Ændringer af denne politik",
        paragraphs: [
          "Denne privatlivspolitik opdateres efter behov, for eksempel når funktioner eller indlejrede tjenester ændres. Den version, der er offentliggjort her, gælder i hvert enkelttilfælde.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Brugsbetingelser",
    title: "Brugsbetingelser",
    subtitle: "Betingelserne for din brug af værktøjerne, der tilbydes her.",
    lastUpdatedLabel: "Sidst opdateret",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "kontaktadresse på anmodning",
    sections: [
      {
        heading: "1. Anvendelsesområde",
        paragraphs: [
          "Disse brugsbetingelser gælder for din brug af dette websted og de værktøjer, der tilbydes her til opslag af IP-, domæne- og netværksoplysninger. Ved at bruge webstedet accepterer du disse betingelser.",
          "Dette websted er et privat, ikke-kommercielt hobbyprojekt, der stilles til rådighed uden beregning. Hvis du ikke accepterer betingelserne, beder vi dig om ikke at bruge webstedet.",
        ],
      },
      {
        heading: "2. Tjenestebeskrivning",
        paragraphs: [
          "Webstedet stiller værktøjer til rådighed til at slå offentligt tilgængelige oplysninger om IP-adresser, domæner og netværk op. Visse resultater stammer fra eksterne offentlige tjenester og gengives uden nogen garanti for rigtighed, fuldstændighed eller aktualitet.",
          "Værktøjerne er beregnet til teknisk interesserede brugere og erstatter ikke professionel rådgivning om netværk, sikkerhed eller jura.",
        ],
      },
      {
        heading: "3. Tjenestens tilgængelighed",
        paragraphs: [
          "Der er ingen ret til en bestemt eller uafbrudt tilgængelighed af webstedet. Driften kan når som helst, uden varsel, vedligeholdes, begrænses, ændres eller ophæves permanent.",
          "For at forhindre misbrug og overbelastning kan enkelte anmodninger være hastighedsbegrænsede eller blive afvist.",
        ],
      },
      {
        heading: "4. Acceptabel brug",
        paragraphs: [
          "Du forpligter dig til kun at bruge webstedet i overensstemmelse med gældende lovgivning. Følgende er især forbudt:",
        ],
        bullets: [
          "at foretage automatiserede eller masseforespørgsler i et omfang, der forringer driften eller omgår hastighedsgrænserne;",
          "at bruge værktøjerne til at forberede eller gennemføre angreb, uvedkommende adgang eller andre ulovlige handlinger;",
          "at indtaste mål eller loginoplysninger, som du ikke er berettiget til at teste;",
          "at omgå webstedets tekniske begrænsninger eller sikkerhedsforanstaltninger;",
          "at bruge webstedet på en måde, der krænker tredjeparts rettigheder eller overtræder gældende lovgivning.",
        ],
      },
      {
        heading: "5. Ingen garanti for resultaterne",
        paragraphs: [
          "De hentede oplysninger leveres kun til tekniske og informative formål. De kan være ufuldstændige, forældede eller forkerte og erstatter ikke faglig, juridisk eller sikkerhedsmæssig rådgivning.",
          "Du vurderer og bruger selv resultaterne. Vi påtager os intet ansvar for beslutninger, som du træffer på grundlag af de viste oplysninger.",
        ],
      },
      {
        heading: "6. Eksterne tjenester og indhold",
        paragraphs: [
          "For at levere resultater sendes anmodninger til eksterne tjenester. Den enkelte udbyder er ansvarlig for deres indhold, tilgængelighed og databehandling. Oplysninger om de indlejrede tjenester findes i privatlivspolitikken.",
        ],
      },
      {
        heading: "7. Ansvar",
        paragraphs: [
          "Værktøjerne leveres ”som de er” uden nogen garantier. I det omfang, loven tillader, er ansvaret for skader som følger af brugen af webstedet, dets utilgængelighed eller tillid til de viste resultater udelukket.",
          "Dette påvirker ikke ansvaret for forsæt og grov uagtsomhed eller ansvaret for skader som følge af skade på liv, krop eller helbred.",
        ],
      },
      {
        heading: "8. Ansvar for links",
        paragraphs: [
          "Webstedet kan indeholde henvisninger til eksterne tredjepartswebsteder eller vise resultater, der peger på dem. Vi har ingen indflydelse på deres indhold og påtager os intet ansvar herfor. Den enkelte udbyder er altid ansvarlig for indholdet på de linkede sider.",
        ],
      },
      {
        heading: "9. Ophavsret",
        paragraphs: [
          "Webstedets design og den underliggende kildekode er beskyttet af ophavsretsregler eller reguleres af projektets respektive licens. De data, der vises via værktøjerne, kommer overvejende fra offentlige kilder hos tredjeparter og kan være underlagt deres brugsbetingelser.",
        ],
      },
      {
        heading: "10. Databeskyttelse",
        paragraphs: [
          "Du kan finde oplysninger om behandling af personoplysninger i privatlivspolitikken. Ved at bruge webstedet tager du den deri beskrevne databehandling til efterretning.",
        ],
      },
      {
        heading: "11. Slutbestemmelser",
        paragraphs: [
          "Hvis enkelte bestemmelser i disse brugsbetingelser er eller bliver ugyldige, berøres de øvrige bestemmelsers gyldighed ikke heraf.",
          "Loven i det land, hvor den dataansvarlige er etableret, gælder, medmindre ufravigelige lovbestemmelser, for eksempel til fordel for forbrugere, udelukker dette.",
        ],
      },
      {
        heading: "12. Ændringer af betingelserne",
        paragraphs: [
          "Disse brugsbetingelser kan justeres efter behov, for eksempel når funktioner eller indlejrede tjenester ændres. Den version, der er offentliggjort her, gælder i hvert enkelttilfælde.",
          "Du kan kontakte os om spørgsmål på: {email}",
        ],
      },
    ],
  },
};

const nb: LegalContent = {
  privacy: {
    navLabel: "Personvern",
    title: "Personvernerklæring",
    subtitle:
      "Slik behandler dette nettstedet personopplysninger, særlig IP-adresser.",
    lastUpdatedLabel: "Sist oppdatert",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "kontaktadresse på forespørsel",
    controllerNotConfigured:
      "driftsansvarlig for dette nettstedet (identitet på forespørsel)",
    sections: [
      {
        heading: "1. Behandlingsansvarlig",
        paragraphs: [
          "Dette nettstedet er et privat, ikke-kommersielt hobbyprosjekt. Den behandlingsansvarlige etter personvernforordningen (GDPR) er {controller}.",
          "Kontaktopplysninger for personvernspørsmål: {email}",
        ],
      },
      {
        heading: "2. Dataminimering",
        paragraphs: [
          "Dette nettstedet bruker ingen sporingskaker, analyseverktøy for nettsteder, annonsenettverk eller brukerkonti. Det opprettes ingen sporings-, annons- eller permanente brukerprofiler, og ingen personopplysninger behandles for markedsføringsformål.",
          "Når din egen IP-adresse vises, avledes imidlertid nettverksattributter direkte fra den, som omtrentlig beliggenhet, leverandør/ASN, tilkoblingstype og en vurdering av proxy/hosting. Dette brukes bare til å vise resultatet umiddelbart og lagres ikke permanent eller kombineres til en personprofil.",
        ],
      },
      {
        heading: "3. Tilgangsdata og IP-adresse",
        paragraphs: [
          "Når du åpner nettstedet, behandler serveren teknisk nødvendige tilgangsdata, blant annet IP-adressen din. IP-adressen brukes til å levere nettstedet og kortvarig til å forebygge misbruk og overbelastning (hastighetsbegrensning).",
          "Hastighetsbegrensningen lagrer bare midlertidige tellere i minnet (et tidsvindu på omtrent 60 sekunder). Programmet oppretter ikke selv en permanent loggdatabase med IP-adresser.",
          "Det rettslige grunnlaget er det berettigede interesset i å drive nettstedet sikkert og stabilt i henhold til GDPR artikkel 6 nr. 1 bokstav f. Uavhengig av dette kan hostingleverandøren føre egne serverlogger.",
        ],
      },
      {
        heading: "4. Behandling ved bruk av verktøyene",
        paragraphs: [
          "Hovedfunksjonen i dette nettstedet er å slå opp informasjon om IP-adresser, domener og nettverk. Når du viser din egen IP-adresse eller kontrollerer en IP-adresse eller et domene, sendes den aktuelle IP-adressen eller domenet til eksterne offentlige tjenester for å hente den forespurte informasjonen.",
          "Noen verktøy behandler mer enn bare en IP-adresse eller et domene: Ved CDN-kontroll ber det målet om hele URL-adressen du skriver inn, inkludert bane og spørringsparametere. Kontroller av tilgjengelighet (ping/database) kan under opprettelse av tilkoblingen overføre opplysninger du skriver inn, for eksempel brukernavn og passord, til målet du har angitt. Slike inndata brukes bare til den aktuelle kontrollen, lagres ikke permanent og deles ikke med tredjeparter utover det angitte målet.",
          "Det rettslige grunnlaget er GDPR artikkel 6 nr. 1 bokstav f (å levere funksjonen du aktivt har bedt om).",
        ],
      },
      {
        heading: "5. Innebygde eksterne tjenester",
        paragraphs: [
          "Avhengig av hvilket verktøy som brukes, sendes forespørsler til følgende tjenester. Noen av dem befinner seg utenfor EU/EØS, særlig i USA. En slik overføring til et tredjeland skjer på grunnlag av den enkelte leverandørens regler for personvern og overføring; for enkelte leverandører kan det mangle en beslutning om tilstrekkelig beskyttelsesnivå og egnede garantier i henhold til GDPR artikkel 46. Du kan be om nærmere opplysninger om overføringsgrunnlaget for en bestemt tjeneste via kontaktadressen nedenfor.",
        ],
        bullets: [
          "ip-api.com – IP-geolokalisering og nettverksmetadata (på serveren).",
          "ipinfo.io – valgfrie ASN-detaljer dersom et token er konfigurert (på serveren).",
          "stat.ripe.net (RIPE NCC, EU) – offentlige ruting- og ASN-data (på serveren).",
          "peeringdb.com – offentlige nettverks- og peeringprofiler (på serveren).",
          "WHOIS/RDAP – ved WHOIS-oppslag sendes det oppgitte målet først til whois.iana.org og deretter til den relevante register- eller henvisnings-WHOIS-serveren; rdap.org fungerer som RDAP- eller reservekilde (på serveren).",
          "DNS-blokkeringslister: zen.spamhaus.org (inkludert SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – ved ryktekontroller overføres den kontrollerte IP-adressen på serveren via DNS-forespørsler.",
          "api.blocklist.de – i tillegg antallet rapporterte angrep mot den kontrollerte IP-adressen (på serveren, uten API-nøkkel).",
          "Feodo Tracker (feodotracker.abuse.ch) og Spamhaus DROP (drop/dropv6) – data om botnet-C2 og kriminelle nettblokker; disse datakildene lastes ned og mellomlagres jevnlig på serveren. Den kontrollerte IP-adressen sendes ikke til abuse.ch eller Spamhaus ved kontroller basert på disse kildene.",
          "api.greynoise.io (Community API) – kontekst for skannere på tvers av internett; uten autentisering eller med en valgfri gratisnøkkel; resultater mellomlagres på serveren per IP-adresse i 24 timer.",
          "api.abuseipdb.com – valgfrie rykte- og misbruksdata dersom en nøkkel er konfigurert (på serveren).",
          "dnsbl.httpbl.org (Project Honey Pot) – valgfrie data om nettabmisbruk (harvesters, kommentarspammere) dersom en tilgangsnøkkel er konfigurert (på serveren).",
          "threatfox-api.abuse.ch – valgfrie oppslag etter trusselindikatorer (IOC) dersom en Auth-Key er konfigurert (på serveren).",
          "flagcdn.com – landflagg. Når et resultat inneholder et land, videresendes den tilhørende landkoden på serveren via en egen proxy til flagcdn.com (IP-adressen din sendes ikke videre); flaggbildet mellomlagres på serveren.",
          "Rekursiv DNS-resolver – ved domenebaserte kontroller løses det oppgitte vertsnavnet via DNS-resolveren som er konfigurert av vertsmiljøet eller systemet; resolveren (som eventuelt drives av hostingleverandøren) mottar vertsnavnet som det spørres etter.",
          "api64.ipify.org og checkip.amazonaws.com – finner din egen IP-adresse direkte i nettleseren; IP-adressen din sendes direkte til disse tjenestene.",
        ],
      },
      {
        heading: "6. Lokal lagring (tema)",
        paragraphs: [
          "Temavalget ditt (lyst/mørkt/system) lagres som en verdi i nettleserens lokale lagring (localStorage). Dette er teknisk funksjonelt, brukes bare til å bevare innstillingen din og overfører ingen data til serveren eller tredjeparter. Det kreves ikke samtykke til dette.",
        ],
      },
      {
        heading: "7. Informasjonskaksel",
        paragraphs: [
          "Dette nettstedet setter ingen samtykke-, sporing- eller annan informasjonskaksel og bruker ingen tilsvarende teknikker for å gjenkjenne deg på tvers av enheter. Det lagres bare temavalget ditt i nettleserens lokale lagring, slik det er teknisk nødvendig og beskrevet under ”Lokal lagring (tema)”.",
          "Fordi det ikke brukes informasjonskaksel eller sporingsteknologier som krever samtykke, er det ikke nødvendig med en informasjonskakselbanner på dette nettstedet.",
        ],
      },
      {
        heading: "8. Datasikkerhet",
        paragraphs: [
          "Nettstedet leveres over kryptert HTTPS (TLS) for å beskytte overføringen mot uautorisert tilgang og manipulasjon. I tillegg treffer vi, innenfor hobbyprosjektets muligheter, egnede tekniske og organisatoriske tiltak for å beskytte behandlede data mot tap, misbruk og uautorisert tilgang.",
          "Fullstendig beskyttelse ved overføring over internett kan imidlertid ikke garanteres med dagens tekniske nivå.",
        ],
      },
      {
        heading: "9. Kontakt oss",
        paragraphs: [
          "Hvis du kontakter oss på den oppgitte adressen, behandler vi opplysningene du deler med oss, for eksempel e-postadressen din og innholdet i meldingen, utelukkende for å håndtere henvendelsen din. Det rettslige grunnlaget er vårt berettigede interesse i å besvare forespørsler i henhold til GDPR artikkel 6 nr. 1 bokstav f.",
          "Opplysningene slettes så snart de ikke lenger er nødvendige for å håndtere henvendelsen og det ikke gjelder lovbestemte oppbevaringsplikter.",
        ],
      },
      {
        heading: "10. Oppbevaringstid",
        paragraphs: [
          "Programmet lagrer ikke forespørselsdata permanent. Tellerne for hastighetsbegrensning utløper når tidsvinduet går ut (omtrent 60 sekunder); den tilhørende oppføringen fjernes faktisk fra minnet ved en senere opprydding som utløses av etterfølgende forespørsler. Hvis det ikke kommer mer trafikk, kan en utløpt oppføring bli liggende i minnet til neste opprydding eller til prosessen starter på nytt. Det skjer ingen permanent lagring eller lagring som kan vurderes personlig.",
          "Data som sendes til eksterne tjenester, er underlagt de respektive leverandørenes personvernerklæringer.",
        ],
      },
      {
        heading: "11. Ingen automatisert beslutningstaking",
        paragraphs: [
          "Det skjer ingen utelukkende automatisert beslutningstaking, inkludert profilering, i henhold til GDPR artikkel 22. Vurderingene verktøyene viser, for eksempel om tilkoblingstype eller bruk av proxy/hosting, er kun ment å informere deg direkte og har ingen rettslig virkning overfor deg.",
        ],
      },
      {
        heading: "12. Dine rettigheter",
        paragraphs: [
          "Når de lovbestemte vilkårene er oppfylt, har du rett til innsyn, beriktigelse, sletting, begrensning av behandlingen, dataportabilitet og til å protestere mot behandling basert på berettigede interesser.",
          "Siden behandlingen skjer med utgangspunkt i berettigede interesser, har du også til enhver tid rett til å protestere mot behandlingen av hensyn til din særlige situasjon (GDPR artikkel 21).",
          "Du har også rett til å klage til et personverntilsyn. Du kan kontakte oss om alle henvendelser på: {email}",
        ],
      },
      {
        heading: "13. Endringer i denne policyen",
        paragraphs: [
          "Denne personvernerklæringen oppdateres ved behov, for eksempel når funksjoner eller innebygde tjenester endres. Versjonen som publiseres her, gjelder på det tidspunktet.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Bruksvilkår",
    title: "Bruksvilkår",
    subtitle: "Vilkårene som gjelder for bruken av verktøyene som tilbys her.",
    lastUpdatedLabel: "Sist oppdatert",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "kontaktadresse på forespørsel",
    sections: [
      {
        heading: "1. Virkeområde",
        paragraphs: [
          "Disse bruksvilkårene gjelder når du bruker dette nettstedet og verktøyene som tilbys her for å slå opp informasjon om IP, domener og nettverk. Ved å bruke nettstedet godtar du disse vilkårene.",
          "Dette nettstedet er et privat, ikke-kommersielt hobbyprosjekt som tilbys uten kostnad. Hvis du ikke godtar vilkårene, ber vi deg om å ikke bruke nettstedet.",
        ],
      },
      {
        heading: "2. Tjenestebeskrivelse",
        paragraphs: [
          "Nettstedet tilbyr verktøy for å slå opp offentlig tilgjengelige opplysninger om IP-adresser, domener og nettverk. Noen resultater kommer fra eksterne offentlige tjenester og gjengis uten garantier for riktighet, fullstendighet eller aktualitet.",
          "Verktøyene er beregnet på teknisk interesserte brukere og erstatter ikke profesjonell rådgivning om nettverk, sikkerhet eller juss.",
        ],
      },
      {
        heading: "3. Tilgjengelighet for tjenesten",
        paragraphs: [
          "Det foreligger ingen rett til bestemt eller uavbrutt tilgjengelighet for nettstedet. Driften kan når som helst, uten varsel, vedlikeholdes, begrenses, endres eller avsluttes permanent.",
          "For å forebygge misbruk og overbelastning kan enkelte forespørsler være hastighetsbegrenset eller bli avvist.",
        ],
      },
      {
        heading: "4. Tillatt bruk",
        paragraphs: [
          "Du forplikter deg til å bruke nettstedet bare i samsvar med gjeldende lov. Følgende er særlig forbudt:",
        ],
        bullets: [
          "å gjøre automatiserte eller masseforespørsler i et omfang som svekker driften eller omgår hastighetsgrensene;",
          "å bruke verktøyene til å forberede eller gjennomføre angrep, uautorisert tilgang eller andre ulovlige handlinger;",
          "å oppgi mål eller påloggingsdetaljer som du ikke har tillatelse til å teste;",
          "å omgå nettstedets tekniske begrensninger eller sikkerhetstiltak;",
          "å bruke nettstedet på en måte som krenker tredjeparts rettigheter eller bryter med gjeldende lov.",
        ],
      },
      {
        heading: "5. Ingen garanti for resultatene",
        paragraphs: [
          "De hentede opplysningene leveres kun til tekniske og informative formål. De kan være ufullstendige, foreldrede eller feilaktige og erstatter ikke faglig, juridisk eller sikkerhetsmessig rådgivning.",
          "Du vurderer og bruker selv resultatene. Vi påtar oss intet ansvar for beslutninger du tar på grunnlag av opplysningene som vises.",
        ],
      },
      {
        heading: "6. Eksterne tjenester og innhold",
        paragraphs: [
          "For å levere resultater sendes forespørsler til eksterne tjenester. Den enkelte leverandøren er ansvarlig for innholdet, tilgjengeligheten og databehandlingen. Du finner opplysninger om de innebygde tjenestene i personvernerklæringen.",
        ],
      },
      {
        heading: "7. Ansvar",
        paragraphs: [
          "Verktøyene leveres ”som de er”, uten garantier. I den utstrekning loven tillater, er ansvaret for skader som følger av bruk av nettstedet, dets utilgjengelighet eller tillit til resultatene som vises, utelukket.",
          "Dette påvirker ikke ansvaret for forsett og grov uaktsomhet eller ansvaret for skader som følger av skade på liv, kropp eller helse.",
        ],
      },
      {
        heading: "8. Ansvar for lenker",
        paragraphs: [
          "Nettstedet kan inneholde henvisninger til eksterne nettsteder fra tredjeparter eller vise resultater som peker til slike nettsteder. Vi har ingen innflytelse på innholdet og påtar oss intet ansvar for det. Den enkelte leverandøren er alltid ansvarlig for innholdet på de lenkede sidene.",
        ],
      },
      {
        heading: "9. Opphavsrett",
        paragraphs: [
          "Utformingen av nettstedet og den underliggende kildekoden er beskyttet av opphavsrettsregler eller regulert av prosjektets gjeldende lisens. Dataene som vises via verktøyene, kommer hovedsakelig fra offentlige kilder hos tredjeparter og kan være underlagt deres bruksvilkår.",
        ],
      },
      {
        heading: "10. Personvern",
        paragraphs: [
          "Du finner opplysninger om behandling av personopplysninger i personvernerklæringen. Ved å bruke nettstedet bekrefter du at du har lest den databehandlingen som beskrives der.",
        ],
      },
      {
        heading: "11. Sluttbestemmelser",
        paragraphs: [
          "Hvis enkelte bestemmelser i disse bruksvilkårene er eller blir ugyldige, berøres ikke de øvrige bestemmelsenes gyldighet av dette.",
          "Loven i landet der den behandlingsansvarlige har sitt sete, gjelder, med mindre ufravikelige lovbestemmelser, for eksempel til fordel for forbrukere, utelukker dette.",
        ],
      },
      {
        heading: "12. Endringer i disse vilkårene",
        paragraphs: [
          "Disse bruksvilkårene kan justeres ved behov, for eksempel når funksjoner eller innebygde tjenester endres. Versjonen som publiseres her, gjelder på det tidspunktet.",
          "Du kan kontakte oss om spørgsmål på: {email}",
        ],
      },
    ],
  },
};

const fi: LegalContent = {
  privacy: {
    navLabel: "Tietosuoja",
    title: "Tietosuojakäytäntö",
    subtitle:
      "Näin tämä sivusto käsittelee henkilötietoja, erityisesti IP-osoitteita.",
    lastUpdatedLabel: "Viimeksi päivitetty",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "yhteystiedot pyydettäessä",
    controllerNotConfigured: "tämän sivuston ylläpitäjä (tunnus pyydettäessä)",
    sections: [
      {
        heading: "1. Rekisterinpitäjä",
        paragraphs: [
          "Tämä sivusto on yksityinen, kaupallisen toiminnan ulkopuolinen harrastushanke. Tietosuoja-asetuksessa (GDPR) tarkoitetun rekisterinpitäjän on {controller}.",
          "Tietosuojaan liittyvissä asioissa voit ottaa yhteyttä: {email}",
        ],
      },
      {
        heading: "2. Tietojen minimointi",
        paragraphs: [
          "Tämä sivusto ei käytä seurantakeitteitä, verkkosanalyysityökaluja, mainosverkostoja tai käyttäjätilejä. Se ei muodosta seuranta-, mainonta- tai pysyviä käyttäjäprofiileja eikä käsittele henkilötietoja markkinointitarkoituksiin.",
          "Kun omaa IP-osoitettasi näytetään, siitä johdetaan kuitenkin välittömästi verkkotietoja, kuten likimääräinen sijainti, palveluntarjoaja/ASN, yhteyden tyyppi ja proxy-/hosting-arvio. Niitä käytetään vain tuloksen välittömään näyttämiseen, eikä niitä säilytetä pysyvästi tai yhdistetä henkilöprofiiliksi.",
        ],
      },
      {
        heading: "3. Käyttödata ja IP-osoite",
        paragraphs: [
          "Kun avaat sivuston, palvelin käsittelee teknisesti välttämätöntä käyttödataa, mukaan lukien IP-osoitteesi. IP-osoitetta käytetään sivuston toimittamiseen ja lyhytaikaisesti väärinkäytön ja ylikuormituksen estämiseen (pyyntörajoitus).",
          "Pyyntörajoitus säilyttää muistissa vain väliaikaisia laskureita (noin 60 sekunnin ikkunana). Sovellus ei itse luo pysyvää IP-osoitelokia.",
          "Oikeusperuste on oikeutettu etu pitää sivusto turvallisena ja vakaana GDPR:n 6 artiklan 1 kohdan f alueella. Tästä riippumatta hostingpalveluntarjoaja voi pitää omia palvelinlokejaan.",
        ],
      },
      {
        heading: "4. Käsittely työkalujen käytön aikana",
        paragraphs: [
          "Sivuston päätoiminto on hakea tietoja IP-osoitteista, verkkotunnuksista ja verkoista. Kun katsot omaa IP-osoitettasi tai tarkistat IP-osoitteen tai verkkotunnuksen, kyseinen IP-osoite tai verkkotunnus lähetetään ulkoisiin julkisiin palveluihin pyydettyjen tietojen hakemiseksi.",
          "Jotkin työkalut käsittelevät muutakin kuin IP-osoitteen tai verkkotunnuksen: CDN-tarkistuksessa kohdepalvelimelta pyydetään koko antamasi URL-osoite polkuineen ja kyselyparametreineen. Tavoitettavuustarkistukset (ping/tietokanta) voivat yhteyttä muodostettaessa lähettää antamasi tunnukset, kuten käyttäjänimen ja salasanan, määritellylle kohteelle. Tällaisia syötteitä käytetään vain kyseiseen tarkistukseen, niitä ei säilytetä pysyvästi eikä jaeta kolmansille osapuolille kyseisen kohteen lisäksi.",
          "Oikeusperuste on GDPR:n 6 artiklan 1 kohdan f alue (pyynnöstäsi aktiivisesti pyydetyn toiminnon tarjoaminen).",
        ],
      },
      {
        heading: "5. Upotetut ulkoiset palvelut",
        paragraphs: [
          "Käytetystä työkalusta riippuen pyyntöjä lähetetään seuraaviin palveluihin. Osa palveluista sijaitsee EU:n ja ETA:n ulkopuolella, erityisesti Yhdysvaltain alueella. Tällainen siirto kolmanteen maahan tapahtuu kyseisen palveluntarjoajan tietosuoja- ja tiedonsiirtosääntöjen perusteella; joiltain palveluntarjoajilta saattaa puuttua riittävää suojaa koskeva päätös ja GDPR:n 46 artiklan mukaiset asianmukaiset takeet. Voit pyytää lisätietoja tietyn palvelun siirtoperusteesta alla olevasta yhteystiedosta.",
        ],
        bullets: [
          "ip-api.com – IP-geolokointi ja verkkometatiedot (palvelimella).",
          "ipinfo.io – valinnaiset ASN-tiedot, jos token on määritetty (palvelimella).",
          "stat.ripe.net (RIPE NCC, EU) – julkiset reititys- ja ASN-tiedot (palvelimella).",
          "peeringdb.com – julkiset verkko- ja peering-profiilit (palvelimella).",
          "WHOIS/RDAP – WHOIS-hakua tehtäessä annettu kohde lähetetään ensin whois.iana.org-palvelimeen ja sitten kyseiseen rekisteröinti- tai ohjaus-WHOIS-palvelimeen; rdap.org toimii RDAP- tai varapalveluna (palvelimella).",
          "DNS-esto- ja mustalistat: zen.spamhaus.org (mukaan lukien SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – mainetta tarkistettaessa kysytty IP-osoite välitetään palvelimella DNS-kyselyiden kautta.",
          "api.blocklist.de – lisäksi kysytylle IP-osoitteelle raportoidun hyökkäysten määrä (palvelimella, ilman API-avainta).",
          "Feodo Tracker (feodotracker.abuse.ch) ja Spamhaus DROP (drop/dropv6) – bottnet-C2- ja rikollisten verkkolohkojen aineistot; nämä tietolähteet ladataan säännöllisin välein palvelimelle ja tallennetaan välimuistiin. Kysyttyä IP-osoitetta ei lähetetä näihin lähteisiin perustuvissa tarkistuksissa abuse.ch- tai Spamhaus-palveluun.",
          "api.greynoise.io (Community API) – koko internetiä koskevien skannausten taustatieto; ilman tunnistautumista tai valinnaisella ilmaisella avaimella; tulokset tallennetaan palvelimella välimuistiin kunkin IP-osoitteen osalta 24 tunniksi.",
          "api.abuseipdb.com – valinnaiset mainetta ja väärinkäyttöä koskevat tiedot, jos avain on määritetty (palvelimella).",
          "dnsbl.httpbl.org (Project Honey Pot) – valinnaiset verkkowrongoista koskevat tiedot (harvesters, kommenttispämmi), jos käyttöavain on määritetty (palvelimella).",
          "threatfox-api.abuse.ch – valinnaiset uhka-indikaattoreiden (IOC) haut, jos Auth-Key on määritetty (palvelimella).",
          "flagcdn.com – maiden liput. Kun tulos sisältää maan, kyseinen maakoodi välitetään palvelimella oman välityspalvelimen kautta flagcdn.com-palveluun (IP-osoitettasi ei välitetä samalla); lippukuva tallennetaan palvelimella välimuistiin.",
          "Rekursiivinen DNS-ratkaisija – verkkotunnuspohjaisissa tarkistuksissa annettu isäntänimi ratkaistaan palvelinympäristön tai järjestelmän määrittämällä DNS-ratkaisijalla; ratkaisija (jonka palveluntarjoaja mahdollisesti ylläpitää) vastaanottaa kysytyn isäntänimen.",
          "api64.ipify.org ja checkip.amazonaws.com – tunnistavat oman IP-osoitteesi suoraan selaimesta; IP-osoitteesi välitetään suoraan näille palveluille.",
        ],
      },
      {
        heading: "6. Paikallinen tallennus (teema)",
        paragraphs: [
          "Tehema-asetelmasi (vaalea/tumma/järjestelmä) tallennetaan selaimen paikalliseen tallennustilaan (localStorage). Tämä on teknisesti toimivaa, palvelee vain asetelmasi säilyttämistä eikä lähetä tietoja palvelimelle tai kolmansille osapuolille. Siihen ei tarvita suostumusta.",
        ],
      },
      {
        heading: "7. Evästeet",
        paragraphs: [
          "Tämä sivusto ei aseta suostumus-, seuranta- tai mainosevästeitä eikä käytä vastaavia tekniikoita tunnistaakseen sinua eri laitteiden välillä. Ainoa tallennus on selaimen paikallisessa tallennustilassa säilytettävä teema-asetelma, joka on teknisesti välttämätön ja kuvattu kohdassa ”Paikallinen tallennus (teema)”.",
          "Koska sivusto ei käytä suostumusta edellyttäviä evästeitä tai seurantatekniikoita, sivustolla ei tarvita evästebanneriä.",
        ],
      },
      {
        heading: "8. Tietojen turvallisuus",
        paragraphs: [
          "Sivusto tarjotaan salattuna HTTPS-yhteyden (TLS) kautta siirron suojaamiseksi luvattomalta käytöltä ja manipuoinnilta. Lisäksi harrastushankkeen mahdollisuuksien rajoissa toteutetaan asianmukaisia teknisiä ja organisatorisia toimenpiteitä käsiteltyjen tietojen suojaamiseksi katoamiselta, väärinkäytöltä ja luvattomalta käytöltä.",
          "Täydellistä suojaa siirrossa internetin yli ei kuitenkaan voida nykyisen teknisen tason perusteella taata.",
        ],
      },
      {
        heading: "9. Yhteydenotto",
        paragraphs: [
          "Jos otat yhteyttä antamalla olevaan osoitteeseen, käsittelemme antamiasi tietoja, kuten sähköpostiosoitettasi ja viestin sisältöä, ainoastaan pyyntösi käsittelemiseksi. Oikeusperuste on oikeutettu etumme vastata tiedusteluihin GDPR:n 6 artiklan 1 kohdan f alueella.",
          "Tiedot poistetaan heti, kun niitä ei enää tarvita pyynnön käsittelyyn eikä lakisääteisiä säilytysvelvoitteita sovelleta.",
        ],
      },
      {
        heading: "10. Säilytysaika",
        paragraphs: [
          "Sovellus ei säilytä pyyntödataa pysyvästi. Pyyntörajoitusten laskurit vanhenevat, kun aikajakso päättyy (noin 60 sekuntia); niihin liittyvä tietue poistetaan muistista myöhemmässä siivouksessa, jonka myöhemmät pyynnöt käynnistävät. Jos uusia pyyntöjä ei tule, jo vanhentunut tietue voi säilyä muistissa seuraavaan siivoukseen tai prosessin uudelleenkäynnistykseen asti. Pysyvää tai henkilökohtaisesti arvioitavaa säilytystä ei tapahdu.",
          "Ulkoisille palveluille lähetetyt tiedot ovat kyseisten palveluntarjoajien tietosuojasääntöjen alaisia.",
        ],
      },
      {
        heading: "11. Ei automaattista päätöksentekoa",
        paragraphs: [
          "GDPR:n 22 artiklassa tarkoitetussa mielessä ei tehdä yksinomaan automaattista päätöksentekoa, mukaan lukien profilointia. Työkaluissa näytettävät arviot, kuten yhteyden tyyppi tai proxy-/hosting-käyttö, on tarkoitettu vain sinun välittömään tiedottamiseesi eivätkä ne aiheuta sinulle oikeudellista vaikutusta.",
        ],
      },
      {
        heading: "12. Oikeutesi",
        paragraphs: [
          "Lakisääteisiin edellytyksiin sovellettaessa sinulla on oikeus tutustua tietoihin, saada niiden oikaistuksi, poistettuksi, käsittelyn rajoittamiseen ja tietojen siirrettävyyteen sekä vastustaa oikeutettuun etuun perustuvaa käsittelyä.",
          "Koska käsittely perustuu oikeutettuun etuun, sinulla on lisäksi oikeus milloin tahansa vedota erityiseen tilanteeseesi perustuviin syihin ja vastustaa kyseistä käsittelyä (GDPR:n 21 artikla).",
          "Sinulla on myös oikeus tehdä valitus tietosuojavaltuutetulle. Kaikissa asioissa voit ottaa yhteyttä: {email}",
        ],
      },
      {
        heading: "13. Tämän käytännön muutokset",
        paragraphs: [
          "Päivitämme tätä tietosuojakäytäntöä tarpeen mukaan, esimerkiksi kun toimintoja tai upotettuja palveluita muutetaan. Kullakin hetkellä sovelluuksiin tässä julkaistu versio.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Käyttöehdot",
    title: "Käyttöehdot",
    subtitle: "Täällä tarjottujen työkalujen käyttöä koskevat ehdot.",
    lastUpdatedLabel: "Viimeksi päivitetty",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "yhteystiedot pyydettäessä",
    sections: [
      {
        heading: "1. Soveltamisala",
        paragraphs: [
          "Nämä käyttöehdot koskevat tämän sivuston sekä täällä tarjottujen IP-, verkkotunnus- ja verkkotietojen hakutyökalujen käyttöä. Käyttämällä sivustoa hyväksyt nämä ehdot.",
          "Tämä sivusto on yksityinen, kaupallisen toiminnan ulkopuolinen harrastushanke, joka tarjotaan maksutta. Jos et hyväksy ehtoja, pyydämme sinua olemaan käyttämättä sivustoa.",
        ],
      },
      {
        heading: "2. Palvelun kuvaus",
        paragraphs: [
          "Sivusto tarjoaa työkaluja, joilla voi hakea IP-osoitteiden, verkkotunnusten ja verkkojen julkisesti saatavilla olevia tietoja. Osa tuloksista on peräisin ulkoisista julkisista palveluista, eikä niiden oikeellisuudesta, täydellisyydestä tai ajantasaisuudesta anneta mitään takuuta.",
          "Työkalut on tarkoitettu teknisesti kiinnostuneille käyttäjille, eivätkä ne korvaa ammattilaisten verkkotietojen, tietoturva- tai oikeudellista neuvontaa.",
        ],
      },
      {
        heading: "3. Palvelun saatavuus",
        paragraphs: [
          "Sivuston tiettyä tai jatkuvaa saatavuutta ei ole taattu. Toimintaa voidaan milloin tahansa ilman ennakkoilmoitusta ylläpitää, rajoittaa, muuttaa tai lopettaa pysyvästi.",
          "Väärinkäytön ja ylikuormituksen estämiseksi yksittäisiin pyyntöihin voidaan soveltaa pyyntörajoitusta tai ne voidaan hylätä.",
        ],
      },
      {
        heading: "4. Sallittu käyttö",
        paragraphs: [
          "Sitoudut käyttämään sivustoa vain sovellettavan lain mukaisesti. Erityisesti seuraavat toimet ovat kiellettyjä:",
        ],
        bullets: [
          "tehdä automaattisia tai joukkokyselyitä sellaisessa määrässä, että ne heikentävät toimintaa tai kiertävät pyyntörajoja;",
          "käyttää työkaluja hyökkäysten, luvattoman käytön tai muiden laittomien tekojen valmisteluun tai toteuttamiseen;",
          "antaa kohteita tai kirjautumistietoja, joiden testaamiseen sinulla ei ole lupaa;",
          "kiertää sivuston teknisiä rajoituksia tai turvatoimenpiteitä;",
          "käyttää sivustoa tavalla, joka loukkaa kolmansien osapuolten oikeuksia tai rikkoo sovellettavaa lakia.",
        ],
      },
      {
        heading: "5. Ei takuuta tuloksista",
        paragraphs: [
          "Haetut tiedot toimitetaan vain teknisiin ja tiedotuksellisiin tarkoituksiin. Ne voivat olla puutteellisia, vanhentuneita tai virheellisiä, eivätkä ne korvaa ammattilaisten neuvontaa verkko-, tietoturva- tai oikeuskysymyksissä.",
          "Tulosten arviointi ja käyttö ovat omalla vastuullasi. Emme vastaa päätöksistä, jotka teet näytettyjen tietojen perusteella.",
        ],
      },
      {
        heading: "6. Ulkoiset palvelut ja sisältö",
        paragraphs: [
          "Tulosten tarjoamiseksi lähetetään pyyntöjä ulkoisille palveluille. Kukin palveluntarjoaja vastaa niiden sisällöstä, saatavuudesta ja tietojen käsittelystä. Upotettuja palveluita koskevat tiedot löytyvät tietosuojakäytännöstä.",
        ],
      },
      {
        heading: "7. Vastuu",
        paragraphs: [
          "Työkalut toimitetaan ”sellaisenaan” ilman minkäänlaisia takuita. Lain sallimassa määrässä vastuu vahingoista, jotka johtuvat sivuston käytöstä tai saatavuuden puutteesta tai näytettyihin tuloksiin luottamisesta, on poissuljettu.",
          "Tämä ei rajoita vastuuta tahallisesta teosta tai törkeästä huolimattomuudesta eikä vastuuta henkilövahingoista, jotka johtuvat elämän, ruumiin tai terveyden vahingoittumisesta.",
        ],
      },
      {
        heading: "8. Vastuu linkeistä",
        paragraphs: [
          "Sivustolla voi olla viittauksia kolmansien osapuolten ulkoisiin verkkosivustoihin tai tuloksia, joilla viitataan niihin. Emme vaikuta niiden sisältöön emmekä vastaa siitä. Kukin palveluntarjoaja vastaa aina linkitettyjen sivujen sisällöstä.",
        ],
      },
      {
        heading: "9. Immateriaalioikeudet",
        paragraphs: [
          "Sivuston ulkoasu ja taustalla oleva lähdekoodi on suojattu immateriaalioikeuksilla tai sääntöjen mukaan määräytyy projektin soveltuvan lisenssin mukaan. Työkaluilla näytettävät tiedot ovat suurelta osin kolmansien osapuolten julkisista lähteistä, ja niihin voi soveltua kyseisten osapuolten käyttöehdot.",
        ],
      },
      {
        heading: "10. Tietosuoja",
        paragraphs: [
          "Tietoja henkilötietojen käsittelystä on tietosuojakäytännössä. Käyttämällä sivustoa hyväksyt siellä kuvatun tietojenkäsittelyn.",
        ],
      },
      {
        heading: "11. Loppusäännökset",
        paragraphs: [
          "Jos jokin näistä käyttöehdoista on tai tulee mitättömäksi, muiden ehtojen voimassaolo ei siitä kärsi.",
          "Sovelletaan rekisterinpitäjän kotipaikassa voimassa olevaa lakia, ellei pakottava lainsääntö, esimerkiksi kuluttajien hyväksi oleva sääntely, estä sitä.",
        ],
      },
      {
        heading: "12. Näiden ehtojen muutokset",
        paragraphs: [
          "Näitä käyttöehtoja voidaan muuttaa tarpeen mukaan, esimerkiksi kun toimintoja tai upotettuja palveluita muutetaan. Kullakin hetkellä sovelluuksiin tässä julkaistu versio.",
          "Kysymyksissä voit ottaa yhteyttä: {email}",
        ],
      },
    ],
  },
};

const el: LegalContent = {
  privacy: {
    navLabel: "Προστασία προσωπικών δεδομένων",
    title: "Πολιτική απορρήτου ιδιωτικότητας",
    subtitle:
      "Πώς αυτός ο ιστότοπος διαχειρίζεται δεδομένα προσωπικού χαρακτήρα, ιδίως διευθύνσεις IP.",
    lastUpdatedLabel: "Τελευταία ενημέρωση",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "διεύθυνση επικοινωνίας κατόπιν αιτήματος",
    controllerNotConfigured:
      "ο διαχειριστής του ιστότοπου (ταυτότητα κατόπιν αιτήματος)",
    sections: [
      {
        heading: "1. Υπεύθυνος επεξεργασίας",
        paragraphs: [
          "Ο ιστότοπος αυτός αποτελεί ιδιωτικό, μη εμπορικό έργο ερασιτεχνικού χαρακτήρα. Υπεύθυνος επεξεργασίας κατά την έννοια του Γενικού Κανονισμού Προστασίας Δεδομένων (GDPR) είναι {controller}.",
          "Στοιχεία επικοινωνίας για θέματα προστασίας δεδομένων: {email}",
        ],
      },
      {
        heading: "2. Ελαχιστοποίηση δεδομένων",
        paragraphs: [
          "Ο ιστότοπος δεν χρησιμοποιεί cookies παρακολούθησης, εργαλεία διαδικτυακής ανάλυσης, διαφημιστικά δίκτυα ούτε λογαριασμούς χρηστών. Δεν δημιουργούνται προφίλ παρακολούθησης, διαφημιστικά ή μόνιμα προφίλ χρηστών και δεν γίνεται επεξεργασία προσωπικών δεδομένων για σκοπούς μάρκετινγκ.",
          "Ωστόσο, όταν εμφανίζεται η δική σας διεύθυνση IP, αποσπώνται αμέσως χαρακτηριστικά δικτύου από αυτήν, όπως η κατά προσέγγιση θέση, ο πάροχος/ASN, ο τύπος σύνδεσης και η εκτίμηση χρήσης proxy/hosting. Χρησιμοποιούνται μόνο για την άμεση εμφάνιση του αποτελέσματος, δεν αποθηκεύονται μόνιμα και δεν συνδυάζονται σε προσωπικό προφίλ.",
        ],
      },
      {
        heading: "3. Δεδομένα πρόσβασης και διεύθυνση IP",
        paragraphs: [
          "Όταν ανοίγετε τον ιστότοπο, ο διακομιστής επεξεργάζεται τεχνικά απαραίτητα δεδομένα πρόσβασης, συμπεριλαμβανομένης της διεύθυνσης IP σας. Η διεύθυνση IP χρησιμοποιείται για την παράδοση του ιστότοπου και για σύντομο διάστημα για την αποτροπή καταχρήσεων και υπερφορτώσεων (περιορισμός ρυθμού).",
          "Ο περιορισμός ρυθμού διατηρεί στη μνήμη μόνο προσωρινούς μετρητές (χρονικό παράθυρο περίπου 60 δευτερολέπτων). Η εφαρμογή δεν δημιουργεί μόνιμη βάση δεδομένων καταγραφής με διευθύνσεις IP.",
          "Νόμιμη βάση είναι το νόμιμο συμφέρον για την ασφαλή και αξιόπιστη λειτουργία του ιστότοπου, βάσει του άρθρου 6 παρ. 1 στοιχ. στ. του GDPR. Ανεξάρτητα από αυτό, ο πάροχος φιλοξενίας ενδέχεται να τηρεί δικά του αρχεία καταγραφής διακομιστή.",
        ],
      },
      {
        heading: "4. Επεξεργασία κατά τη χρήση των εργαλείων",
        paragraphs: [
          "Ο βασικός σκοπός του ιστότοπου είναι η αναζήτηση πληροφοριών σχετικών με διευθύνσεις IP, τομείς και δίκτυα. Όταν βλέπετε τη δική σας διεύθυνση IP ή ελέγχετε μια διεύθυνση IP ή έναν τομέα, η αντίστοιχη διεύθυνση IP ή τομέας αποστέλλεται σε εξωτερικές δημόσιες υπηρεσίες για την εξασφάλιση των ζητούμενων πληροφοριών.",
          "Ορισμένα εργαλεία επεξεργάζονται περισσότερα από μία διεύθυνση IP ή τομέα: ο έλεγχος CDN ζητά από τον στόχο ολόκληρη τη διεύθυνση URL που εισαγάγατε, συμπεριλαμβανομένης της διαδρομής και των παραμέτρων ερωτήματος. Οι έλεγχοι προσβασιμότητας (ping/βάση δεδομένων) ενδέχεται, κατά τη σύνδεση, να μεταδίδουν στον στόχο που έχετε ορίσει διαπιστευτήρια που έχετε εισαγάγει, όπως όνομα χρήστη και κωδικό πρόσβασης. Τα στοιχεία αυτά χρησιμοποιούνται μόνο για τον αντίστοιχο έλεγχο, δεν αποθηκεύονται μόνιμα και δεν κοινοποιούνται σε τρίτους πέρα από τον στόχο που έχετε ορίσει.",
          "Νόμιμη βάση είναι το άρθρο 6 παρ. 1 στοιχ. στ. του GDPR (παροχή της λειτουργίας που ζητήσατε ενεργά).",
        ],
      },
      {
        heading: "5. Ενσωματωμένες εξωτερικές υπηρεσίες",
        paragraphs: [
          "Ανάλογα με το εργαλείο που χρησιμοποιείται, αποστέλλονται αιτήματα στις ακόλουθες υπηρεσίες. Ορισμένες από αυτές βρίσκονται εκτός της ΕΕ/ΕΟΖ, ιδίως στις ΗΠΑ. Κάθε τέτοια μεταφορά σε τρίτη χώρα διενεργείται βάσει των όρων προστασίας και μεταφοράς δεδομένων του εκάστοτε παρόχου· για ορισμένους παρόχους ενδέχεται να μην υπάρχει απόφαση επαρκότητας και να λείπουν κατάλληλες εγγυήσεις κατά την έννοια του άρθρου 46 του GDPR. Μπορείτε να ζητήσετε περισσότερες λεπτομέρειες για τη νομική βάση μεταφοράς συγκεκριμένης υπηρεσίας μέσω της παρακάτω διεύθυνσης επικοινωνίας.",
        ],
        bullets: [
          "ip-api.com – γεωτοπισμός IP και μεταδεδομένα δικτύου (στο διακομιστή).",
          "ipinfo.io – προαιρετικά στοιχεία ASN, εάν έχει διαμορφωθεί token (στο διακομιστή).",
          "stat.ripe.net (RIPE NCC, EU) – δημόσια δεδομένα δρομολόγησης και ASN (στο διακομιστή).",
          "peeringdb.com – δημόσια προφίλ δικτύων και peering (στο διακομιστή).",
          "WHOIS/RDAP – για αναζητήσεις WHOIS, ο στόχος που εισάγεται αποστέλλεται πρώτα στο whois.iana.org και έπειτα στον αντίστοιχο διακομιστή WHOIS μητρώου ή παραπομπής· το rdap.org χρησιμεύει ως πηγή RDAP ή εναλλακτική πηγή (στο διακομιστή).",
          "Λίστες αποκλεισμού DNS: zen.spamhaus.org (συμπεριλαμβανομένων SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – κατά τους ελέγχους αξιοπιστίας, η ελεγχόμενη διεύθυνση IP αποστέλλεται στο διακομιστή μέσω ερωτημάτων DNS.",
          "api.blocklist.de – επιπλέον, τον αριθμό των αναφερθεισών επιθέσεων κατά της ελεγχόμενης διεύθυνσης IP (στο διακομιστή, χωρίς κλειδί API).",
          "Feodo Tracker (feodotracker.abuse.ch) και Spamhaus DROP (drop/dropv6) – σύνολα δεδομένων botnet C2 και εγκληματικών δικτυακών μπλοκ· αυτές οι πηγές δεδομένων λαμβάνονται και αποθηκεύονται στην κρυφή μνήμη του διακομιστή σε τακτικά διαστήματα. Η ελεγχόμενη διεύθυνση IP δεν αποστέλλεται στην abuse.ch ή στη Spamhaus για ελέγχους που βασίζονται σε αυτές τις πηγές.",
          "api.greynoise.io (Community API) – πληροφορίες περιβάλλοντος για σαρωτές σε ολόκληρο το διαδίκτυο· με ή χωρίς ταυτοποίηση, ή με προαιρετικό δωρεάν κλειδί· τα αποτελέσματα αποθηκεύονται στην κρυφή μνήμη του διακομιστή ανά διεύθυνση IP για 24 ώρες.",
          "api.abuseipdb.com – προαιρετικά δεδομένα φήμης και καταχρήσεων, εάν έχει διαμορφωθεί κλειδί (στο διακομιστή).",
          "dnsbl.httpbl.org (Project Honey Pot) – προαιρετικά δεδομένα για καταχρήσεις ιστού (harvesters, σχόλια spam), εάν έχει διαμορφωθεί κλειδί πρόσβασης (στο διακομιστή).",
          "threatfox-api.abuse.ch – προαιρετικές αναζητήσεις δεικτών απειλών (IOC), εάν έχει διαμορφωθεί Auth-Key (στο διακομιστή).",
          "flagcdn.com – σημαίες χωρών. Όταν ένα αποτέλεσμα περιέχει χώρα, ο αντίστοιχος κωδικός χώρας προωθείται στο διακομιστή μέσω δικού του διαμεσολαβητή προς το flagcdn.com (η διεύθυνση IP σας δεν προωθείται)· η εικόνα της σημαίας αποθηκεύεται στην κρυφή μνήμη του διακομιστή.",
          "Αναδρομικός επιλύτης DNS – για ελέγχους που βασίζονται σε τομείς, το όνομα κεντρικού υπολογιστή που εισάγατε επιλύεται μέσω του επιλύτη DNS που έχει ρυθμίσει το περιβάλλον φιλοξενίας ή το σύστημα· ο επιλύτης (πιθανώς σε λειτουργία του παρόχου φιλοξενίας) λαμβάνει το όνομα κεντρικού υπολογιστή του ερωτήματος.",
          "api64.ipify.org και checkip.amazonaws.com – εντοπισμός της δικής σας διεύθυνσης IP απευθείας στο πρόγραμμα περιήγησης· η διεύθυνση IP σας αποστέλλεται απευθείας σε αυτές τις υπηρεσίες.",
        ],
      },
      {
        heading: "6. Τοπική αποθήκευση (θέμα)",
        paragraphs: [
          "Η προτίμηση θέματος (φωτεινό/σκοτεινό/σύστημα) αποθηκεύεται ως τιμή στην τοπική αποθήκευση του προγράμματος περιήγησης (localStorage). Η αποθήκευση είναι τεχνικά λειτουργική, εξυπηρετεί μόνο τη διατήρηση της προτίμησής σας και δεν μεταδίδει δεδομένα στον διακομιστή ή σε τρίτους. Δεν απαιτείται συναίνεση.",
        ],
      },
      {
        heading: "7. Cookies",
        paragraphs: [
          "Ο ιστότοπος δεν τοποθετεί cookies συναίνεσης, παρακολούθησης ή διαφημίσεων και δεν χρησιμοποιεί ανάλογες τεχνικές για να σας αναγνωρίζει σε διαφορετικές συσκευές. Πραγματοποιείται μόνο η τεχνικά απαραίτητη αποθήκευση της προτίμησης θέματος που περιγράφεται στην ενότητα «Τοπική αποθήκευση (θέμα)», στην τοπική αποθήκευση του προγράμματος περιήγησης.",
          "Επειδή δεν χρησιμοποιούνται cookies ή εργαλεία παρακολούθησης που απαιτούν συναίνεση, ο ιστότοπος δεν χρειάζεται πλακίδιο συναίνεσης για cookies.",
        ],
      },
      {
        heading: "8. Ασφάλεια δεδομένων",
        paragraphs: [
          "Ο ιστότοπος παρέχεται μέσω κρυπτογραφημένης σύνδεσης HTTPS (TLS), ώστε η μεταφορά να προστατεύεται από μη εξουσιοδοτημένη πρόσβαση και παραποίηση. Πέρα από αυτό, στο πλαίσιο των δυνατοτήτων του ερασιτεχνικού έργου λαμβάνονται κατάλληλα τεχνικά και οργανωτικά μέτρα για την προστασία των επεξεργαζόμενων δεδομένων από απώλεια, καταχρήση και μη εξουσιοδοτημένη πρόσβαση.",
          "Η πλήρης προστασία κατά τη μεταφορά μέσω του διαδικτύου δεν μπορεί, ωστόσο, να εγγυηθεί με βάση το σημερινό επίπεδο τεχνολογίας.",
        ],
      },
      {
        heading: "9. Επικοινωνία μαζί μας",
        paragraphs: [
          "Εάν επικοινωνείτε μαζί μας στη διεύθυνση που παρέχεται, επεξεργαζόμαστε τα στοιχεία που μας κοινοποιείτε, όπως τη διεύθυνση email σας και το περιεχόμενο του μηνύματος, αποκλειστικά για τη διεκόλυνση του αιτήματός σας. Νόμιμη βάση είναι το νόμιμο συμφέρον μας να απαντούμε σε ερωτήματα βάσει του άρθρου 6 παρ. 1 στοιχ. στ. του GDPR.",
          "Τα στοιχεία διαγράφονται μόλις δεν είναι πλέον απαραίτητα για τη διεκόλυνση του αιτήματος και δεν υπάρχει αντίθετη νομική υποχρέωση διατήρησης.",
        ],
      },
      {
        heading: "10. Περίοδος αποθήκευσης",
        paragraphs: [
          "Η εφαρμογή δεν αποθηκεύει μόνιμα δεδομένα αιτημάτων. Οι μετρητές περιορισμού ρυθμού λήγουν μετά το χρονικό παράθυρο (περίπου 60 δευτερόλεπτα)· η σχετική καταχώριση αφαιρείται πραγματικά από τη μνήμη κατά τον μεταγενέστερο καθαρισμό που προκαλείται από επόμενα αιτήματα. Εάν δεν προκύψει άλλη κίνηση, μια ήδη ληξμένη καταχώριση ενδέχεται να παραμείνει στη μνήμη έως τον επόμενο καθαρισμό ή έως την επανεκκίνηση της διαδικασίας. Δεν πραγματοποιείται μόνιμη αποθήκευση ούτε αποθήκευση που επιτρέπει αξιολόγηση σε ατομικό επίπεδο.",
          "Τα δεδομένα που αποστέλλονται σε εξωτερικές υπηρεσίες υπόκεινται στην πολιτική ιδιωτικότητας του αντίστοιχου παρόχου.",
        ],
      },
      {
        heading: "11. Καμία αυτοματοποιημένη λήψη αποφάσεων",
        paragraphs: [
          "Δεν πραγματοποιείται αποκλειστικά αυτοματοποιημένη λήψη αποφάσεων, ούτε δημιουργία προφίλ κατά την έννοια του άρθρου 22 του GDPR. Οι εκτιμήσεις που εμφανίζουν τα εργαλεία, όπως ο τύπος σύνδεσης ή η χρήση proxy/hosting, εξυπηρετούν μόνο την άμεση ενημέρωσή σας και δεν έχουν καμία νομική συνέπεια σε βάρος σας.",
        ],
      },
      {
        heading: "12. Τα δικαιώματά σας",
        paragraphs: [
          "Με την επιφύλαξη των νόμιμων προϋποθέσεων, έχετε δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, περιορισμού της επεξεργασίας και φορητότητας δεδομένων, καθώς και δικαίωμα αντιρρήσεως στην επεξεργασία που βασίζεται σε νόμιμο συμφέρον.",
          "Επειδή η επεξεργασία βασίζεται σε νόμιμο συμφέρον, έχετε επίσης το δικαίωμα να αντιλογείστε ανά πάσα στιγμή, για λόγους που απορρέουν από την ιδιαιτέρη κατάστασή σας, κατά της εν λόγω επεξεργασίας (άρθρο 21 του GDPR).",
          "Έχετε επίσης το δικαίωμα να υποβάλετε καταγγελία σε αρχή προστασίας δεδομένων. Για κάθε θέμα, μπορείτε να επικοινωνήσετε μαζί μας στο: {email}",
        ],
      },
      {
        heading: "13. Αλλαγές στην πολιτική",
        paragraphs: [
          "Η παρούσα πολιτική απορρήτου ιδιωτικότητας επικαιροποιείται όταν χρειάζεται, για παράδειγμα όταν αλλάζουν λειτουργίες ή ενσωματωμένες υπηρεσίες. Κάθε φορά εφαρμόζεται η έκδοση που δημοσιεύεται εδώ.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Όροι χρήσης",
    title: "Όροι χρήσης",
    subtitle:
      "Οι όροι που διέπουν τη χρήση των εργαλείων που προσφέρονται εδώ.",
    lastUpdatedLabel: "Τελευταία ενημέρωση",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "διεύθυνση επικοινωνίας κατόπιν αιτήματος",
    sections: [
      {
        heading: "1. Πεδίο εφαρμογής",
        paragraphs: [
          "Οι παρόντες όροι χρήσης ισχύουν για τη χρήση αυτού του ιστότοπου και των εργαλείων που προσφέρονται εδώ για την αναζήτηση πληροφοριών IP, τομέων και δικτύων. Με τη χρήση του ιστότοπου αποδέχεστε τους παρόντες όρους.",
          "Ο ιστότοπος αυτός αποτελεί ιδιωτικό, μη εμπορικό έργο ερασιτεχνικού χαρακτήρα και παρέχεται δωρεάν. Εάν δεν αποδέχεστε τους όρους, σας παρακαλούμε να μην χρησιμοποιείτε τον ιστότοπο.",
        ],
      },
      {
        heading: "2. Περιγραφή υπηρεσίας",
        paragraphs: [
          "Ο ιστότοπος παρέχει εργαλεία για την αναζήτηση δημόσια διαθέσιμων πληροφοριών σχετικών με διευθύνσεις IP, τομείς και δίκτυα. Μερικά αποτελέσματα προέρχονται από εξωτερικές δημόσιες υπηρεσίες και παρουσιάζονται χωρίς εγγύηση ως προς την ακρίβεια, την πληρότητα ή την επικαιρότητά τους.",
          "Τα εργαλεία απευθύνονται σε τεχνικώς ενδιαφερόμενους χρήστες και δεν υποκαθιστούν επαγγελματική συμβουλή σε θέματα δικτύων, ασφάλειας ή νόμου.",
        ],
      },
      {
        heading: "3. Διαθεσιμότητα της υπηρεσίας",
        paragraphs: [
          "Δεν υπάρχει δικαίωμα σε συγκεκριμένη ή αδιάκοπη διαθεσιμότητα του ιστότοπου. Η λειτουργία του μπορεί να συνεχίζεται, να περιορίζεται, να μεταβάλλεται ή να διακόπτεται οριστικά ανά πάσα στιγμή χωρίς προειδοποίηση.",
          "Για την αποτροπή καταχρήσεων και υπερφορτώσεων, μεμονωμένα αιτήματα ενδέχεται να υπόκεινται σε περιορισμό ρυθμού ή να απορρίπτονται.",
        ],
      },
      {
        heading: "4. Αποδεκτή χρήση",
        paragraphs: [
          "Συμφωνείτε να χρησιμοποιείτε τον ιστότοπο μόνο σύμφωνα με το ισχύον δίκαιο. Ειδικότερα, απαγορεύονται τα ακόλουθα:",
        ],
        bullets: [
          "αυτοματοποιημένες ή μαζικές αναζητήσεις σε κλίμακα που υποβαθμίζει τη λειτουργία ή παρακάμπτει τα όρια ρυθμού;",
          "χρήση των εργαλείων για την προετοιμασία ή την εκτέλεση επιθέσεων, μη εξουσιοδοτημένης πρόσβασης ή άλλων παράνομων ενεργειών;",
          "εισαγωγή στόχων ή διαπιστευτηρίων τα οποία δεν έχετε δικαίωμα να ελέγξετε;",
          "παράκαμψη τεχνικών περιορισμών ή μέτρων ασφαλείας του ιστότοπου;",
          "οποιαδήποτε χρήση που παραβιάζει δικαιώματα τρίτων ή παραβαίνει το ισχύον δίκαιο.",
        ],
      },
      {
        heading: "5. Καμία εγγύηση για τα αποτελέσματα",
        paragraphs: [
          "Οι πληροφορίες που λαμβάνονται παρέχονται μόνο για τεχνικούς και ενημερωτικούς σκοπούς. Ενδέχεται να είναι ελλιπείς, παλιές ή εσφαλμένες και δεν υποκαθιστούν επαγγελματική, νομική ή συμβουλευτική σε θέματα ασφαλείας.",
          "Η αξιολόγηση και η χρήση των αποτελεσμάτων αποτελούν ευθύνη σας. Δεν αναλαμβάνουμε ευθύνη για αποφάσεις που λαμβάνετε με βάση τις εμφανιζόμενες πληροφορίες.",
        ],
      },
      {
        heading: "6. Εξωτερικές υπηρεσίες και περιεχόμενο",
        paragraphs: [
          "Για την παροχή αποτελεσμάτων αποστέλλονται αιτήματα σε εξωτερικές υπηρεσίες. Ο αντίστοιχος πάροχος είναι υπεύθυνος για το περιεχόμενο, τη διαθεσιμότητα και την επεξεργασία δεδομένων τους. Λεπτομέρειες για τις ενσωματωμένες υπηρεσίες παρατίθενται στην πολιτική απορρήτου ιδιωτικότητας.",
        ],
      },
      {
        heading: "7. Ευθύνη",
        paragraphs: [
          "Τα εργαλεία παρέχονται «ως έχουν», χωρίς οποιαδήποτε εγγύηση. Στον βαθμό που επιτρέπεται από τον νόμο, αποκλείεται η ευθύνη για ζημιές που προκύπτουν από τη χρήση ή τη μη διαθεσιμότητα του ιστότοπου ή από την εμπιστοσύνη στα εμφανιζόμενα αποτελέσματα.",
          "Δεν θίγεται η ευθύνη για εκούσια πράξη ή βαριά αμέλεια ούτε η ευθύνη για ζημιές από βλάβη της ζωής, του σώματος ή της υγείας.",
        ],
      },
      {
        heading: "8. Ευθύνη για συνδέσεις",
        paragraphs: [
          "Ο ιστότοπος ενδέχεται να περιέχει παραπομπές σε εξωτερικούς ιστότοπους τρίτων ή να εμφανίζει αποτελέσματα που παραπέμπουν σε αυτούς. Δεν ασκούμε επιρροή στο περιεχόμενό τους και δεν αναλαμβάνουμε ευθύνη για αυτό. Ο αντίστοιχος πάροχος είναι πάντα υπεύθυνος για το περιεχόμενο των συνδεδεμένων σελίδων.",
        ],
      },
      {
        heading: "9. Πνευματική ιδιοκτησία",
        paragraphs: [
          "Ο σχεδιασμός του ιστότοπου και ο υποκείμενος πηγαίος κώδικας προστατεύονται από δικαιώματα πνευματικής ιδιοκτησίας ή υπόκεινται στην ισχύουσα άδεια του έργου. Τα δεδομένα που εμφανίζονται μέσω των εργαλείων προέρχονται κυρίως από δημόσιες πηγές τρίτων και ενδέχεται να υπόκεινται στους όρους χρήσης τους.",
        ],
      },
      {
        heading: "10. Προστασία δεδομένων",
        paragraphs: [
          "Πληροφορίες σχετικά με την επεξεργασία προσωπικών δεδομένων παρατίθενται στην πολιτική απορρήτου ιδιωτικότητας. Με τη χρήση του ιστότοπου λαμβάνετε γνώση της επεξεργασίας δεδομένων που περιγράφεται εκεί.",
        ],
      },
      {
        heading: "11. Τελικές διατάξεις",
        paragraphs: [
          "Εάν ορισμένες διατάξεις των παρόντων όρων χρήσης είναι ή καταστούν άκυρες, η ισχύς των υπολοίπων διατάξεων δεν θίγεται.",
          "Εφαρμόζεται ο νόμος της χώρας όπου έχει την έδρα του ο υπεύθυνος επεξεργασίας, εκτός εάν τούτο αποκλείεται από αναγκαστικούς νόμιμους κανόνες, για παράδειγμα υπέρ των καταναλωτών.",
        ],
      },
      {
        heading: "12. Αλλαγές στους όρους",
        paragraphs: [
          "Οι παρόντες όροι χρήσης ενδέχεται να προσαρμόζονται όταν απαιτείται, για παράδειγμα όταν αλλάζουν λειτουργίες ή ενσωματωμένες υπηρεσίες. Κάθε φορά εφαρμόζεται η έκδοση που δημοσιεύεται εδώ.",
          "Για οποιαδήποτε απορία μπορείτε να επικοινωνήσετε μαζί μας στο: {email}",
        ],
      },
    ],
  },
};

const ro: LegalContent = {
  privacy: {
    navLabel: "Confidențialitate",
    title: "Politica de confidențialitate",
    subtitle:
      "Cum gestionează acest site datele cu caracter personal, în special adresele IP.",
    lastUpdatedLabel: "Ultima actualizare",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "adresă de contact la cerere",
    controllerNotConfigured: "operatorul acestui site (identitate la cerere)",
    sections: [
      {
        heading: "1. Responsabilul cu privirea la datele cu caracter personal",
        paragraphs: [
          "Acest site este un proiect privat, necomercial, realizat ca hobby. Responsabilul cu privirea la datele cu caracter personal în sensul Regulamentului general privind protecția datelor (GDPR) este {controller}.",
          "Date de contact pentru aspecte legate de protecția datelor: {email}",
        ],
      },
      {
        heading: "2. Minimizarea datelor",
        paragraphs: [
          "Acest site nu folosește cookie-uri de urmărire, instrumente de analiză web, rețele publicitare sau conturi de utilizator. Nu se construiesc profiluri de urmărire, publicitare sau permanente și nu se prelucrează date cu caracter personal în scopuri de marketing.",
          "Când este afișată propria adresă IP, din aceasta sunt deduse imediat atribute de rețea, precum locația aproximativă, furnizorul/ASN, tipul de conexiune și o evaluare a utilizării proxy/hosting. Acestea servesc exclusiv pentru afișarea imediată a rezultatului, nu sunt păstrate permanent și nu sunt asociate într-un profil personal.",
        ],
      },
      {
        heading: "3. Date de acces și adresa IP",
        paragraphs: [
          "La deschiderea site-ului, serverul prelucrează date de acces tehnic necesare, inclusiv adresa dumneavoastră IP. Adresa IP este folosită pentru furnizarea site-ului și, pentru scurt timp, pentru prevenirea abuzurilor și a suprasolicitării (limitarea frecvenței cererilor, rate limiting).",
          "Limitarea frecvenței păstrează în memorie numai contoare temporare (o fereastră de timp de aproximativ 60 de secunde). Aplicația nu creează ea însăși o bază de date permanentă cu adrese IP.",
          "Baza legală este interesul legitim în operarea sigură și fiabilă a site-ului, în temeiul art. 6 alin. (1) lit. f) din GDPR. Independent de aceasta, furnizorul de găzduire poate păstra propriile jurnale de server.",
        ],
      },
      {
        heading: "4. Prelucrarea la utilizarea instrumentelor",
        paragraphs: [
          "Funcția principală a acestui site este căutarea informațiilor despre adrese IP, domenii și rețele. Când vă afișați propria adresă IP sau verificați o adresă IP ori un domeniu, adresa IP sau domeniul respectiv este trimis către servicii publice externe pentru obținerea informațiilor solicitate.",
          "Unele instrumente prelucrează mai mult decât o adresă IP sau un domeniu: verificarea CDN solicită adresa URL completă introdusă, inclusiv calea și parametrii interogării, către destinație. Verificările de accesibilitate (ping/bază de date) pot transmite, în cursul stabilirii conexiunii, credențiale introduse de dvs., precum numele de utilizator și parola, către destinația indicată. Aceste informații sunt folosite numai pentru verificarea respectivă, nu sunt păstrate permanent și nu sunt comunicate terților în afara destinației indicate.",
          "Baza legală este art. 6 alin. (1) lit. f) din GDPR (furnizarea funcției pe care ați solicitat-o activ).",
        ],
      },
      {
        heading: "5. Servicii externe încorporate",
        paragraphs: [
          "În funcție de instrumentul utilizat, cereri sunt trimise către următoarele servicii. Unele dintre acestea au sediul în afara UE/SEE, în special în Statele Unite. O astfel de transfer într-o țară terță are loc în baza condițiilor de protecție și de transfer de date ale furnizorului respectiv; pentru anumiți furnizori poate lipsi o decizie de adecvare și pot lipsi garanții adecvate în sensul art. 46 din GDPR. Puteți solicita detalii suplimentare privind temeiul transferului pentru un anumit serviciu prin adresa de contact de mai jos.",
        ],
        bullets: [
          "ip-api.com – geolocalizarea adreselor IP și metadate de rețea (pe server).",
          "ipinfo.io – detalii ASN opționale, dacă este configurat un token (pe server).",
          "stat.ripe.net (RIPE NCC, UE) – date publice de rutare și ASN (pe server).",
          "peeringdb.com – profiluri publice de rețea și peering (pe server).",
          "WHOIS/RDAP – pentru căutări WHOIS, destinația introdusă este trimisă mai întâi către whois.iana.org, apoi către serverul WHOIS corespunzător al registrului sau de trimitere; rdap.org servește drept sursă RDAP sau sursă de rezervă (pe server).",
          "Liste de blocare DNS: zen.spamhaus.org (inclusiv SBL/CSS/XBL/PBL), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – la verificarea reputației, adresa IP verificată este transmisă pe server prin interogări DNS.",
          "api.blocklist.de – în plus, numărul atacurilor raportate împotriva adresei IP verificate (pe server, fără cheie API).",
          "Feodo Tracker (feodotracker.abuse.ch) și Spamhaus DROP (drop/dropv6) – seturi de date despre botnet C2 și blocuri de rețea folosite în activități infracționale; aceste surse de date sunt descărcate și memorate în cache pe server la intervale regulate. Adresa IP verificată nu este transmisă către abuse.ch sau Spamhaus pentru verificările bazate pe aceste surse.",
          "api.greynoise.io (Community API) – context pentru scanările din întregul internet; fără autentificare sau cu o cheie gratuită opțională; rezultatele sunt memorate în cache pe server pentru fiecare adresă IP timp de 24 de ore.",
          "api.abuseipdb.com – date opționale de reputație și abuz, dacă este configurată o cheie (pe server).",
          "dnsbl.httpbl.org (Project Honey Pot) – date opționale privind abuzul pe web (harvesters, spam în comentarii), dacă este configurată o cheie de acces (pe server).",
          "threatfox-api.abuse.ch – căutări opționale de indicatori de amenințare (IOC), dacă este configurat un Auth-Key (pe server).",
          "flagcdn.com – drapele de țară. Când un rezultat conține o țară, codul acesteia este transmis pe server, printr-un proxy propriu, către flagcdn.com (adresa dumneavoastră IP nu este transmisă); imaginea drapelului este memorată în cache pe server.",
          "Rezolvator DNS recursiv – pentru verificările bazate pe domenii, numele de gazdă introdus este rezolvat prin rezolvatorul DNS configurat de gazdă sau de sistem; acest rezolvator (eventual operat de furnizorul de găzduire) primește numele de gazdă solicitat.",
          "api64.ipify.org și checkip.amazonaws.com – identifică direct adresa dumneavoastră IP din browser; adresa IP este trimisă direct către aceste servicii.",
        ],
      },
      {
        heading: "6. Stocarea locală (temă)",
        paragraphs: [
          "Preferința pentru temă (luminos/întunecat/sistem) este stocată ca valoare în stocarea locală a browserului (localStorage). Acest lucru este necesar din punct de vedere tehnic, servește exclusiv păstrării preferinței și nu transmite date serverului sau terților. Nu este necesar consimțământul pentru această stocare.",
        ],
      },
      {
        heading: "7. Cookie-uri",
        paragraphs: [
          "Acest site nu stabilește cookie-uri de consimțământ, de urmărire sau publicitare și nu folosește tehnici similare pentru a vă recunoaște între diferite dispozitive. Singura stocare este cea tehnic necesară a preferinței pentru temă în stocarea locală a browserului, descrisă la „Stocarea locală (temă)”.",
          "Deoarece nu se folosesc cookie-uri sau urmăritori care necesită consimțământ, acest site nu are nevoie de un banner de consimțământ pentru cookie-uri.",
        ],
      },
      {
        heading: "8. Securitatea datelor",
        paragraphs: [
          "Site-ul este furnizat prin HTTPS criptat (TLS), pentru a proteja transmiterea împotriva accesului neautorizat și a modificării ilicite. În plus, în limitele posibile ale acestui proiect amatoriale, se iau măsuri tehnice și organizatorice adecvate pentru protejarea datelor prelucrate împotriva pierderii, abuzului și accesului neautorizat.",
          "Protecția completă în timpul transmiterii prin internet nu poate fi garantată însă la nivelul tehnic actual.",
        ],
      },
      {
        heading: "9. Contact cu noi",
        paragraphs: [
          "Dacă ne contactați la adresa indicată, prelucrăm informațiile pe care ni le furnizați, precum adresa de e-mail și conținutul mesajului, exclusiv pentru soluționarea solicitării dumneavoastră. Baza legală este interesul nostru legitim de a răspunde solicitărilor, în temeiul art. 6 alin. (1) lit. f) din GDPR.",
          "Informațiile sunt șterse imediat ce nu mai sunt necesare pentru soluționarea solicitării și dacă nu există obligații legale de păstrare.",
        ],
      },
      {
        heading: "10. Perioada de păstrare",
        paragraphs: [
          "Aplicația nu păstrează permanent datele cererilor. Contoarele de limitare a frecvenței expiră după fereastra de timp (aproximativ 60 de secunde); înregistrarea corespunzătoare este eliminată efectiv din memorie la o curățare ulterioară declanșată de cereri următoare. Dacă nu mai apare trafic, o înregistrare deja expirată poate rămâne în memorie până la următoarea curățare sau până la repornirea procesului. Nu are loc o stocare permanentă sau care să poată fi evaluată la nivel personal.",
          "Datele trimise către servicii externe sunt supuse politicilor de confidențialitate ale furnizorilor respectivi.",
        ],
      },
      {
        heading: "11. Fără decizii automatizate",
        paragraphs: [
          "Nu se iau decizii exclusiv automatizate, inclusiv profilare, în sensul art. 22 din GDPR. Evaluările afișate de instrumente, precum tipul de conexiune sau utilizarea proxy/hosting, servesc exclusiv pentru informarea dumneavoastră directă și nu produc efecte juridice în privința dumneavoastră.",
        ],
      },
      {
        heading: "12. Drepturile dumneavoastră",
        paragraphs: [
          "În limitele condițiilor legale, aveți dreptul de acces, rectificare, ștergere, restricționarea prelucrării și portabilitatea datelor, precum și dreptul de a vă opune prelucrării întemeiate pe interese legitime.",
          "Deoarece prelucrarea se întemeiază pe interese legitime, aveți și dreptul de a vă opune în orice moment acestei prelucrări, din motive legate de situația dumneavoastră particulară (art. 21 din GDPR).",
          "Aveți, de asemenea, dreptul de a depune o plângere la o autoritate de supraveghere a protecției datelor. Pentru orice solicitare, ne puteți contacta la: {email}",
        ],
      },
      {
        heading: "13. Modificările acestei politici",
        paragraphs: [
          "Prezenta politică de confidențialitate este actualizată atunci când este necesar, de exemplu atunci când se modifică funcțiile sau serviciile încorporate. Se aplică întotdeauna versiunea publicată aici.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Condiții de utilizare",
    title: "Condiții de utilizare",
    subtitle:
      "Condițiile care guvernează utilizarea instrumentelor oferite aici.",
    lastUpdatedLabel: "Ultima actualizare",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "adresă de contact la cerere",
    sections: [
      {
        heading: "1. Domeniul de aplicare",
        paragraphs: [
          "Prezentele condiții de utilizare se aplică utilizării acestui site și a instrumentelor oferite aici pentru căutarea informațiilor despre IP, domenii și rețele. Prin utilizarea site-ului, sunteți de acord cu aceste condiții.",
          "Acest site este un proiect privat, necomercial, realizat ca hobby și este oferit gratuit. Dacă nu sunteți de acord cu aceste condiții, vă rugăm să nu utilizați site-ul.",
        ],
      },
      {
        heading: "2. Descrierea serviciului",
        paragraphs: [
          "Site-ul oferă instrumente pentru căutarea informațiilor disponibile public despre adrese IP, domenii și rețele. Unele rezultate provin din servicii publice externe și sunt prezentate fără nicio garanție de acuratețe, completitudine sau actualitate.",
          "Instrumentele sunt destinate utilizatorilor cu interese tehnice și nu înlocuiesc consultanța profesională în domeniul rețelelor, securității sau juridic.",
        ],
      },
      {
        heading: "3. Disponibilitatea serviciului",
        paragraphs: [
          "Nu există un drept la o anumită disponibilitate sau la disponibilitate neîntreruptă a site-ului. Funcționarea poate fi întreținută, restricționată, modificată sau oprită definitiv în orice moment, fără notificare prealabilă.",
          "Pentru prevenirea abuzurilor și a suprasolicitării, cererile individuale pot fi limitate ca frecvență sau pot fi refuzate.",
        ],
      },
      {
        heading: "4. Utilizare acceptabilă",
        paragraphs: [
          "Vă angajați să utilizați site-ul numai în conformitate cu legile aplicabile. În special, sunt interzise următoarele acțiuni:",
        ],
        bullets: [
          "efectuarea unor căutări automate sau în masă la o scară care afectează funcționarea sau eludează limitele de frecvență;",
          "utilizarea instrumentelor pentru pregătirea sau desfășurarea atacurilor, a accesului neautorizat sau a altor acte ilegale;",
          "introducerea unor destinații sau credențiale pentru care nu aveți voie să efectuați verificări;",
          "eludarea restricțiilor tehnice sau a măsurilor de securitate ale site-ului;",
          "orice utilizare care încalcă drepturile terților sau contrazine legea aplicabilă.",
        ],
      },
      {
        heading: "5. Fără garanții privind rezultatele",
        paragraphs: [
          "Informațiile obținute sunt furnizate exclusiv în scopuri tehnice și informative. Acestea pot fi incomplete, învechite sau incorecte și nu înlocuiesc consultanța profesională, juridică sau de securitate.",
          "Evaluarea și utilizarea rezultatelor vă revin exclusiv dumneavoastră. Nu ne asumăm răspunderea pentru deciziile pe care le luați pe baza informațiilor afișate.",
        ],
      },
      {
        heading: "6. Servicii și conținut externe",
        paragraphs: [
          "Pentru furnizarea rezultatelor, cereri sunt trimise către servicii externe. Furnizorul respectiv este responsabil pentru conținutul, disponibilitatea și prelucrarea datelor acestora. Detalii despre serviciile încorporate se găsesc în politica de confidențialitate.",
        ],
      },
      {
        heading: "7. Răspundere",
        paragraphs: [
          "Instrumentele sunt furnizate „așa cum sunt”, fără nicio garanție. În măsura permisă de lege, este exclusă răspunderea pentru daunele rezultate din utilizarea sau indisponibilitatea site-ului ori din încrederea în rezultatele afișate.",
          "Acest lucru nu afectează răspunderea pentru intenție și neglijență gravă, nici răspunderea pentru daune rezultate din vătămarea vieții, corpului sau sănătății.",
        ],
      },
      {
        heading: "8. Răspunderea pentru linkuri",
        paragraphs: [
          "Site-ul poate conține trimiteri către site-uri externe ale terților sau poate afișa rezultate care fac trimitere la acestea. Nu avem influență asupra conținutului lor și nu ne asumăm răspunderea pentru acesta. Furnizorul respectiv este întotdeauna responsabil pentru conținutul paginilor legate.",
        ],
      },
      {
        heading: "9. Proprietate intelectuală",
        paragraphs: [
          "Designul site-ului și codul sursă aferent sunt protejate prin drepturile de proprietate intelectuală sau sunt guvernate de licența aplicabilă a proiectului. Datele afișate prin instrumente provin în principal din surse publice ale terților și pot fi supuse condițiilor lor de utilizare.",
        ],
      },
      {
        heading: "10. Protecția datelor",
        paragraphs: [
          "Informațiile despre modul în care sunt prelucrate datele cu caracter personal se găsesc în politica de confidențialitate. Prin utilizarea site-ului, luați cunoștință de prelucrarea datelor descrisă acolo.",
        ],
      },
      {
        heading: "11. Dispoziții finale",
        paragraphs: [
          "Dacă anumite prevederi ale acestor condiții sunt sau devin invalide, validitatea celorlalte prevederi nu este afectată.",
          "Se aplică legea țării în care are sediul responsabilul cu privirea la datele cu caracter personal, cu excepția cazurilor în care dispoziții legale imperative, de exemplu în favoarea consumatorilor, exclud acest lucru.",
        ],
      },
      {
        heading: "12. Modificările acestor condiții",
        paragraphs: [
          "Prezentele condiții pot fi ajustate atunci când este necesar, de exemplu atunci când se modifică funcțiile sau serviciile încorporate. Se aplică întotdeauna versiunea publicată aici.",
          "Pentru orice întrebare, ne puteți contacta la: {email}",
        ],
      },
    ],
  },
};

const tr: LegalContent = {
  privacy: {
    navLabel: "Gizlilik",
    title: "Gizlilik Politikası",
    subtitle:
      "Bu sitenin kişisel verileri, özellikle IP adreslerini nasıl işlediği.",
    lastUpdatedLabel: "Son güncelleme",
    lastUpdated: PRIVACY_LAST_UPDATED,
    contactNotConfigured: "talep üzerine iletişim adresi",
    controllerNotConfigured: "bu sitenin işletmecisi (kimlik talep üzerine)",
    sections: [
      {
        heading: "1. Veri sorumlusu",
        paragraphs: [
          "Bu site kişisel, ticari olmayan bir amatör projesidir. Genel Veri Koruma Tüzüğü (GDPR) anlamında veri sorumlusu {controller}'dir.",
          "Veri koruma konularıyla ilgili iletişim: {email}",
        ],
      },
      {
        heading: "2. Veri minimizasyonu",
        paragraphs: [
          "Bu site izleme çerezleri, web analizi araçları, reklam ağları veya kullanıcı hesapları kullanmaz. İzleme, reklam veya kalıcı kullanıcı profilleri oluşturulmaz; kişisel veriler pazarlama amaçlı işlenmez.",
          "Kendi IP adresiniz gösterildiğinde, bu adresten anlık olarak yaklaşık konum, sağlayıcı/ASN, bağlantı türü ve proxy/hosting değerlendirmesi gibi ağ öznitelikleri çıkarılır. Bunlar yalnızca sonucu hemen göstermek için kullanılır; kalıcı olarak saklanmaz veya kişisel profille birleştirilmez.",
        ],
      },
      {
        heading: "3. Erişim verileri ve IP adresi",
        paragraphs: [
          "Siteyi açtığınızda sunucu; IP adresiniz dâhil, teknik açıdan gerekli erişim verilerini işler. IP adresi sitenin sunulması ve kısa süreli olarak kötüye kullanım ile aşırı yüklenmenin önlenmesi (hız sınırlama) için kullanılır.",
          "Hız sınırlama yalnızca bellekte geçici sayaçları tutar (yaklaşık 60 saniyelik zaman aralığı). Uygulama kendisi kalıcı bir IP adresi günlüğü veritabanı oluşturmaz.",
          "Yasal dayanak, GDPR 6(1)(f) maddesi uyarınca sitenin güvenli ve kararlı şekilde işletilmesine ilişkin meşru menfaattir. Bundan bağımsız olarak barındırma sağlayıcısı kendi sunucu günlüklerini tutabilir.",
        ],
      },
      {
        heading: "4. Araçları kullanırken işleme",
        paragraphs: [
          "Bu sitenin temel işlevi IP adresleri, alan adları ve ağlar hakkında bilgi aramaktır. Kendi IP adresinizi görüntülediğinizde veya bir IP adresini ya da alan adını kontrol ettiğinizde, ilgili IP adresi veya alan adı istenen bilgilerin alınması için harici ve kamuya açık hizmetlere gönderilir.",
          "Bazı araçlar yalnızca bir IP adresi veya alan adından daha fazlasını işler: CDN kontrolünde, yol ve sorgu parametreleri dâhil girdiğiniz URL’in tamamı hedeften istenir. Erişilebilirlik kontrolleri (ping/veritabanı), bağlantıyı kurma sırasında girdiğiniz kullanıcı adı ve parola gibi kimlik bilgilerini belirlediğiniz hedefe aktarabilir. Bu tür girdiler yalnızca ilgili kontrol için kullanılır, kalıcı olarak saklanmaz ve belirlediğiniz hedef dışında üçüncü taraflarla paylaşılmaz.",
          "Yasal dayanak, aktif olarak istediğiniz işlevin sunulması bakımından GDPR 6(1)(f) maddesidir.",
        ],
      },
      {
        heading: "5. Gömülü harici hizmetler",
        paragraphs: [
          "Kullanılan araca bağlı olarak aşağıdaki hizmetlere istek gönderilir. Bu hizmetlerin bir kısmı AB/AEA dışında, özellikle ABD’de bulunur. Böyle bir üçüncü ülkeye aktarım, ilgili sağlayıcının veri koruma ve aktarım koşullarına dayanarak gerçekleştirilir; bazı sağlayıcılar için yeterlilik kararı bulunmayabilir ve GDPR 46. maddesi anlamında uygun güvenceler eksik olabilir. Belirli bir hizmetin aktarım dayanağına ilişkin ayrıntıları aşağıdaki iletişim adresinden isteyebilirsiniz.",
        ],
        bullets: [
          "ip-api.com – IP coğrafi konumlandırması ve ağ meta verileri (sunucu tarafında).",
          "ipinfo.io – bir token yapılandırıldıysa isteğe bağlı ASN ayrıntıları (sunucu tarafında).",
          "stat.ripe.net (RIPE NCC, AB) – kamuya açık yönlendirme ve ASN verileri (sunucu tarafında).",
          "peeringdb.com – kamuya açık ağ ve peering profilleri (sunucu tarafında).",
          "WHOIS/RDAP – WHOIS sorgularında girilen hedef önce whois.iana.org adresine, ardından ilgili kayıt veya yönlendirme WHOIS sunucusuna gönderilir; rdap.org RDAP veya yedek kaynak olarak kullanılır (sunucu tarafında).",
          "DNS engelleme listeleri: zen.spamhaus.org (SBL/CSS/XBL/PBL dahil), bl.spamcop.net, b.barracudacentral.org, dnsbl.dronebl.org, bl.blocklist.de – itibar kontrolünde sorgulanan IP, sunucu tarafında DNS sorguları yoluyla iletilir.",
          "api.blocklist.de – ayrıca sorgulanan IP adresi için bildirilen saldırı sayısı (sunucu tarafında, API anahtarı olmadan).",
          "Feodo Tracker (feodotracker.abuse.ch) ve Spamhaus DROP (drop/dropv6) – botnet C2 ve suç örgütü ağ blokları veri kümeleri; bu veri kaynakları düzenli aralıklarla sunucuya indirilir ve önbelleğe alınır. Bu kaynaklara dayalı kontrollerde sorgulanan IP adresi abuse.ch veya Spamhaus’a iletilmez.",
          "api.greynoise.io (Community API) – internet genelindeki tarayıcılara ilişkin bağlam; kimlik doğrulaması olmadan veya isteğe bağlı ücretsiz anahtarla; sonuçlar sunucuda IP adresi başına 24 saat önbelleğe alınır.",
          "api.abuseipdb.com – bir anahtar yapılandırıldıysa isteğe bağlı itibar ve kötüye kullanım verileri (sunucu tarafında).",
          "dnsbl.httpbl.org (Project Honey Pot) – bir erişim anahtarı yapılandırıldıysa isteğe bağlı web kötüye kullanım verileri (harvesters, yorum spamcıları) (sunucu tarafında).",
          "threatfox-api.abuse.ch – bir Auth-Key yapılandırıldıysa isteğe bağlı tehdit göstergesi (IOC) aramaları (sunucu tarafında).",
          "flagcdn.com – ülke bayrakları. Bir sonuç ülke içerdiğinde, ilgili ülke kodu sunucu tarafında kendi vekili üzerinden flagcdn.com’a iletilir (bu sırada IP adresiniz iletilmez); bayrak görseli sunucuda önbelleğe alınır.",
          "Özyinelemeli DNS çözümleyici – alan adına dayalı kontrollerde, girilen ana makine adı barındırma veya sistem tarafından yapılandırılan DNS çözümleyiciyle çözülür; bu çözümleyici (barındırma sağlayıcısı tarafından işletiliyor olabilir) sorgulanan ana makine adını alır.",
          "api64.ipify.org ve checkip.amazonaws.com – kendi IP adresinizi doğrudan tarayıcınızdan belirler; IP adresiniz doğrudan bu hizmetlere iletilir.",
        ],
      },
      {
        heading: "6. Yerel depolama (tema)",
        paragraphs: [
          "Tema tercihiniz (açık/koyu/sistem), tarayıcınızın yerel deposunda (localStorage) bir değer olarak saklanır. Bu işlev teknik açıdan gereklidir, yalnızca tercihinizi korumak için kullanılır ve sunucuya veya üçüncü taraflara veri iletmez. Bunun için onay gerekmez.",
        ],
      },
      {
        heading: "7. Çerezler",
        paragraphs: [
          "Bu site onay, izleme veya reklam çerezi yerleştirmez; sizi farklı cihazlarda tanımak için benzer teknikler kullanmaz. Yalnızca tarayıcınızın yerel deposunda, teknik açıdan gerekli olan ve “Yerel depolama (tema)” başlığında açıklanan tema tercihi saklanır.",
          "Onay gerektiren çerez veya izleme teknolojileri kullanılmadığı için bu sitede çerez onay şeridi gerekmez.",
        ],
      },
      {
        heading: "8. Veri güvenliği",
        paragraphs: [
          "Site, iletimin yetkisiz erişime ve değiştirilmeye karşı korunması için şifrelenmiş HTTPS (TLS) üzerinden sunulur. Ayrıca bu amatör projenin imkânları çerçevesinde işlenen verilerin kaybına, kötüye kullanımına ve yetkisiz erişime karşı korunması için uygun teknik ve idari önlemler alınır.",
          "Ancak mevcut teknolojik düzey göz önüne alındığında internet üzerinden iletim sırasında eksiksiz koruma garanti edilemez.",
        ],
      },
      {
        heading: "9. Bize ulaşma",
        paragraphs: [
          "Belirtilen adresten bize ulaşırsanız, e-posta adresiniz ve mesajınızın içeriği gibi paylaştığınız bilgileri yalnızca talebinizi ele almak amacıyla işleriz. Yasal dayanak, GDPR 6(1)(f) maddesi uyarınca talepleri yanıtlamaya ilişkin meşru menfaattir.",
          "Bilgiler, talebin ele alınması için gerekli olmaktan çıktığı anda ve yasal saklama yükümlülüğü bulunmadığı sürece silinir.",
        ],
      },
      {
        heading: "10. Saklama süresi",
        paragraphs: [
          "Uygulama istek verilerini kalıcı olarak saklamaz. Hız sınırlama sayaçları zaman aralığı (yaklaşık 60 saniye) sona erdiğinde geçersiz olur; ilgili kayıt, sonraki isteklerin tetiklediği daha sonraki bir temizlik işlemiyle bellekten fiilen kaldırılır. Başka trafik gelmezse, süresi dolmuş bir kayıt bir sonraki temizliğe veya işlemin yeniden başlatılmasına kadar bellekte kalabilir. Kalıcı veya kişiler düzeyinde değerlendirilebilecek bir saklama yapılmaz.",
          "Harici hizmetlere gönderilen veriler, ilgili sağlayıcıların gizlilik politikalarına tabidir.",
        ],
      },
      {
        heading: "11. Otomatik karar verme yoktur",
        paragraphs: [
          "GDPR 22. maddesi anlamında profilleme dâhil yalnızca otomatik karar verme gerçekleştirilmez. Araçların gösterdiği bağlantı türü veya proxy/hosting kullanımı gibi değerlendirmeler yalnızca doğrudan bilgilendirilmeniz amacıyla sunulur ve size karşı hukuki bir etki doğurmaz.",
        ],
      },
      {
        heading: "12. Haklarınız",
        paragraphs: [
          "Yasal koşullar saklı kalmak üzere, verilerinize erişme, düzeltilmesini, silinmesini, işlemenin kısıtlanmasını ve veri taşınabilirliğini isteme; meşru menfaate dayalı işlemeye itiraz etme haklarına sahipsiniz.",
          "İşleme meşru menfaate dayandığı için, özel durumunuzdan doğan nedenlerle bu işleme karşı istediğiniz zaman itiraz etme hakkına da sahipsiniz (GDPR 21. maddesi).",
          "Bir veri koruma denetim makamına şikâyette bulunma hakkına da sahipsiniz. Her türlü talebiniz için bize şu adresten ulaşabilirsiniz: {email}",
        ],
      },
      {
        heading: "13. Bu politikanın değiştirilmesi",
        paragraphs: [
          "Bu gizlilik politikası, özellikler veya gömülü hizmetler değiştiğinde gerektiğinde güncellenir. Her zaman burada yayımlanan sürüm geçerlidir.",
        ],
      },
    ],
  },
  terms: {
    navLabel: "Kullanım koşulları",
    title: "Kullanım koşulları",
    subtitle: "Burada sunulan araçların kullanımını düzenleyen koşullar.",
    lastUpdatedLabel: "Son güncelleme",
    lastUpdated: TERMS_LAST_UPDATED,
    contactNotConfigured: "talep üzerine iletişim adresi",
    sections: [
      {
        heading: "1. Kapsam",
        paragraphs: [
          "Bu kullanım koşulları, IP, alan adı ve ağ bilgilerini aramak için sunulan bu sitenin ve araçların kullanımı için geçerlidir. Siteyi kullanarak bu koşulları kabul etmiş olursunuz.",
          "Bu site kişisel, ticari olmayan bir amatör projesidir ve ücretsiz olarak sunulur. Bu koşulları kabul etmiyorsanız siteyi kullanmamanızı rica ederiz.",
        ],
      },
      {
        heading: "2. Hizmetin açıklaması",
        paragraphs: [
          "Site; IP adresleri, alan adları ve ağlar hakkında kamuya açık olarak erişilebilen bilgileri aramak için araçlar sunar. Bazı sonuçlar harici ve kamuya açık hizmetlerden gelir; doğruluk, eksiksizlik veya güncellik için hiçbir güvence verilmeksizin sunulur.",
          "Araçlar teknik açıdan ilgilenen kullanıcılara yöneliktir; profesyonel ağ, güvenlik veya hukuki danışmanlığın yerine geçmez.",
        ],
      },
      {
        heading: "3. Hizmetin kullanılabilirliği",
        paragraphs: [
          "Belirli veya kesintisiz site kullanılabilirliğine ilişkin bir hak verilmemiştir. Hizmet, önceden bildirilmeksizin her zaman bakım, kısıtlama, değiştirme veya kalıcı olarak sonlandırma şeklinde uygulanabilir.",
          "Kötüye kullanım ve aşırı yüklenmeyi önlemek için tekil istekler hız sınırına tabi tutulabilir veya reddedilebilir.",
        ],
      },
      {
        heading: "4. Kabul edilebilir kullanım",
        paragraphs: [
          "Siteyi yalnızca geçerli yasalara uygun şekilde kullanmayı kabul edersiniz. Özellikle aşağıdaki eylemler yasaktır:",
        ],
        bullets: [
          "hizmetin çalışmasını aksatacak veya hız sınırlarını aşacak ölçekte otomatik veya toplu sorgu yapmak;",
          "araçları saldırı hazırlamak, saldırı veya yetkisiz erişim gerçekleştirmek ya da başka yasadışı eylemlerde bulunmak için kullanmak;",
          "kontrol etme yetkiniz olmayan hedefleri veya kimlik bilgilerini girmek;",
          "sitenin teknik kısıtlamalarını veya güvenlik önlemlerini atlatmak;",
          "üçüncü tarafların haklarını ihlal eden veya geçerli yasalara aykırı her türlü kullanım.",
        ],
      },
      {
        heading: "5. Sonuçlar için garanti verilmez",
        paragraphs: [
          "Getirilen bilgiler yalnızca teknik ve bilgilendirme amaçlarıyla sunulur. Bilgiler eksik, güncel olmayan veya hatalı olabilir; mesleki, hukuki veya güvenlik danışmanlığının yerine geçmez.",
          "Sonuçları değerlendirmek ve kullanmak kendi sorumluluğunuzdadır. Gösterilen bilgilere dayanarak verdiğiniz kararlardan sorumlu değiliz.",
        ],
      },
      {
        heading: "6. Harici hizmetler ve içerik",
        paragraphs: [
          "Sonuçların sunulması için harici hizmetlere istek gönderilir. İlgili sağlayıcı, söz konusu hizmetlerin içeriğinden, kullanılabilirliğinden ve veri işlemesinden sorumludur. Gömülü hizmetlere ilişkin ayrıntılar gizlilik politikasında bulunur.",
        ],
      },
      {
        heading: "7. Sorumluluk",
        paragraphs: [
          "Araçlar hiçbir garanti verilmeksizin “olduğu gibi” sunulur. Yasanın izin verdiği ölçüde, sitenin kullanımından veya kullanılamamasından ya da gösterilen sonuçlara güvenmekten doğan zararlardan sorumluluk kabul edilmez.",
          "Kasıt veya ağır ihmalden doğan sorumluluk ile yaşam, beden veya sağlığa verilen zararlardan doğan sorumluluk bu hükümden etkilenmez.",
        ],
      },
      {
        heading: "8. Bağlantılardan sorumluluk",
        paragraphs: [
          "Site üçüncü tarafların harici web sitelerine bağlantılar içerebilir veya bu sitelere işaret eden sonuçlar gösterebilir. Bu sitelerin içeriği üzerinde etkimiz yoktur ve sorumluluk kabul etmeyiz. Bağlantı verilen sayfaların içeriğinden her zaman ilgili sağlayıcı sorumludur.",
        ],
      },
      {
        heading: "9. Fikri mülkiyet",
        paragraphs: [
          "Sitenin tasarımı ve altında yatan kaynak kodu, fikri mülkiyet haklarıyla korunur veya projenin geçerli lisansına tabidir. Araçlarla gösterilen verilerin büyük bölümü üçüncü tarafların kamuya açık kaynaklarından gelir ve bu kaynakların kullanım koşullarına tabi olabilir.",
        ],
      },
      {
        heading: "10. Veri koruma",
        paragraphs: [
          "Kişisel verilerin nasıl işlendiğine ilişkin bilgileri gizlilik politikasında bulabilirsiniz. Siteyi kullanarak orada açıklanan veri işleme faaliyetini kabul etmiş olursunuz.",
        ],
      },
      {
        heading: "11. Son hükümler",
        paragraphs: [
          "Bu kullanım koşullarının belirli hükümleri geçersizse veya geçersiz hâle gelirse, kalan hükümlerin geçerliliği etkilenmez.",
          "Veri sorumlusunun bulunduğu ülkenin kanunları uygulanır; ancak tüketici lehine olanlar dâhil bağlayıcı yasal hükümler bunun aksi yönünde bir kural koymadıkça.",
        ],
      },
      {
        heading: "12. Bu koşulların değiştirilmesi",
        paragraphs: [
          "Bu kullanım koşulları, özellikler veya gömülü hizmetler değiştiğinde gerektiğinde güncellenebilir. Her zaman burada yayımlanan sürüm geçerlidir.",
          "Sorularınız için bize şu adresten ulaşabilirsiniz: {email}",
        ],
      },
    ],
  },
};

export const legalNorthern: Record<NorthernLocale, LegalContent> = {
  cs,
  sv,
  da,
  nb,
  fi,
  el,
  ro,
  tr,
};
