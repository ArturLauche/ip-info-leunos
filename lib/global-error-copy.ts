import type { Locale } from "@/lib/locale-config";

export type GlobalErrorCopy = {
  title: string;
  description: string;
  retry: string;
};

/**
 * The only strings the root error boundary needs. It renders outside the
 * layout, so it cannot read the I18nProvider, and importing the full tool
 * catalog would ship all 26 languages to every visitor for a page almost
 * nobody sees. lib/i18n.test.ts keeps this table identical to the catalogs.
 */
export const globalErrorCopy: Record<Locale, GlobalErrorCopy> = {
  de: {
    title: "Etwas ist schiefgelaufen",
    description: "Diese Seite konnte nicht geladen werden. Bitte versuche es erneut — wiederholt sich der Fehler, liegt die Ursache bei uns.",
    retry: "Erneut versuchen",
  },
  en: {
    title: "Something went wrong",
    description: "This page could not be loaded. Try again — if it keeps failing, the cause is on our side.",
    retry: "Try again",
  },
  es: {
    title: "Algo ha salido mal",
    description: "No se ha podido cargar esta página. Inténtalo de nuevo; si el problema continúa, la causa está de nuestro lado.",
    retry: "Intentar de nuevo",
  },
  fr: {
    title: "Une erreur s’est produite",
    description: "Cette page n’a pas pu être chargée. Réessayez ; si le problème persiste, la cause est de notre côté.",
    retry: "Réessayer",
  },
  it: {
    title: "Qualcosa è andato storto",
    description: "Non è stato possibile caricare questa pagina. Riprova; se il problema persiste, la causa è dalla nostra parte.",
    retry: "Riprova",
  },
  nl: {
    title: "Er is iets misgegaan",
    description: "Deze pagina kon niet worden geladen. Probeer het opnieuw; als het probleem aanhoudt, ligt de oorzaak aan onze kant.",
    retry: "Opnieuw proberen",
  },
  pl: {
    title: "Coś poszło nie tak",
    description: "Tej strony nie udało się wczytać. Spróbuj ponownie — jeśli problem będzie się powtarzał, przyczyna leży po naszej stronie.",
    retry: "Spróbuj ponownie",
  },
  "pt-BR": {
    title: "Algo deu errado",
    description: "Não foi possível carregar esta página. Tente novamente — se o problema continuar, a causa está do nosso lado.",
    retry: "Tentar novamente",
  },
  "pt-PT": {
    title: "Ocorreu um problema",
    description: "Não foi possível carregar esta página. Tente novamente — se a falha persistir, a causa é nossa.",
    retry: "Tentar novamente",
  },
  ja: {
    title: "問題が発生しました",
    description: "このページを読み込めませんでした。もう一度お試しください。問題が続く場合は、原因は当側にあります。",
    retry: "再試行",
  },
  ko: {
    title: "문제가 발생했습니다",
    description: "이 페이지를 불러오지 못했습니다. 다시 시도해 보세요. 문제가 계속되면 원인은 당사 쪽에 있습니다.",
    retry: "다시 시도",
  },
  ru: {
    title: "Что-то пошло не так",
    description: "Не удалось загрузить эту страницу. Повторите попытку — если ошибка сохраняется, причина на нашей стороне.",
    retry: "Повторить попытку",
  },
  uk: {
    title: "Щось пішло не так",
    description: "Не вдалося завантажити цю сторінку. Спробуйте ще раз — якщо помилка повторюється, причина на нашому боці.",
    retry: "Спробувати ще раз",
  },
  "zh-CN": {
    title: "出现问题",
    description: "无法加载此页面。请重试；如果问题持续存在，原因可能在我们这边。",
    retry: "重试",
  },
  "zh-TW": {
    title: "發生問題",
    description: "無法載入此頁面。請再試一次；如果持續失敗，原因可能在我們這邊。",
    retry: "再試一次",
  },
  ar: {
    title: "حدث خطأ ما",
    description: "تعذر تحميل هذه الصفحة. حاول مرة أخرى؛ وإذا استمر الخطأ فالمشكل من جانبنا.",
    retry: "حاول مرة أخرى",
  },
  hi: {
    title: "कुछ गड़बड़ हो गई",
    description: "यह पेज लोड नहीं हो सका। फिर से प्रयास करें; अगर समस्या बनी रहे, तो कारण हमारी ओर है।",
    retry: "फिर से प्रयास करें",
  },
  id: {
    title: "Terjadi kesalahan",
    description: "Halaman ini tidak dapat dimuat. Coba lagi; jika masalah berlanjut, penyebabnya berada di sisi kami.",
    retry: "Coba lagi",
  },
  cs: {
    title: "Něco se pokazilo",
    description: "Tuto stránku se nepodařilo načíst. Zkuste to znovu — pokud se chyba opakuje, příčina je na naší straně.",
    retry: "Zkusit znovu",
  },
  sv: {
    title: "Något gick fel",
    description: "Den här sidan kunde inte laddas. Försök igen — om felet kvarstår beror det på vår sida.",
    retry: "Försök igen",
  },
  da: {
    title: "Noget gik galt",
    description: "Denne side kunne ikke indlæses. Prøv igen — hvis fejlen fortsætter, ligger årsagen på vores side.",
    retry: "Prøv igen",
  },
  nb: {
    title: "Noe gikk galt",
    description: "Denne siden kunne ikke lastes inn. Prøv igjen — hvis feilen fortsetter, ligger årsaken på vår side.",
    retry: "Prøv igjen",
  },
  fi: {
    title: "Jokin meni pieleen",
    description: "Sivua ei voitu ladata. Yritä uudelleen — jos virhe toistuu, syy on meidän puolellamme.",
    retry: "Yritä uudelleen",
  },
  el: {
    title: "Κάτι πήγε στραβά",
    description: "Δεν ήταν δυνατή η φόρτωση αυτής της σελίδας. Δοκιμάστε ξανά — αν το πρόβλημα συνεχίζεται, η αιτία είναι στο δικό μας σύστημα.",
    retry: "Δοκιμή ξανά",
  },
  ro: {
    title: "Ceva nu a mers bine",
    description: "Pagina nu a putut fi încărcată. Încearcă din nou — dacă problema continuă, cauza este de partea noastră.",
    retry: "Încearcă din nou",
  },
  tr: {
    title: "Bir şeyler ters gitti",
    description: "Bu sayfa yüklenemedi. Tekrar deneyin — hata devam ederse neden bizim tarafımızdadır.",
    retry: "Tekrar dene",
  },
};
