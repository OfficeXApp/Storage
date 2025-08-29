import { ServiceWithOffersFromVendors } from "@officexapp/types";

import af from "./i18n/af.ts";
import ar from "./i18n/ar.ts";
import az from "./i18n/az.ts";
import bg from "./i18n/bg.ts";
import bn from "./i18n/bn.ts";
import cs from "./i18n/cs.ts";
import cy from "./i18n/cy.ts";
import da from "./i18n/da.ts";
import de from "./i18n/de.ts";
import el from "./i18n/el.ts";
import en from "./i18n/en.ts";
import es from "./i18n/es.ts";
import et from "./i18n/et.ts";
import fa from "./i18n/fa.ts";
import fi from "./i18n/fi.ts";
import fil from "./i18n/fil.ts";
import fr from "./i18n/fr.ts";
import ga from "./i18n/ga.ts";
import hi from "./i18n/hi.ts";
import hr from "./i18n/hr.ts";
import hu from "./i18n/hu.ts";
import id from "./i18n/id.ts";
import is from "./i18n/is.ts";
import it from "./i18n/it.ts";
import ja from "./i18n/ja.ts";
import ka from "./i18n/ka.ts";
import kk from "./i18n/kk.ts";
import km from "./i18n/km.ts";
import ko from "./i18n/ko.ts";
import lt from "./i18n/lt.ts";
import lv from "./i18n/lv.ts";
import ms from "./i18n/ms.ts";
import nl from "./i18n/nl.ts";
import pa from "./i18n/pa.ts";
import pl from "./i18n/pl.ts";
import pt from "./i18n/pt.ts";
import ro from "./i18n/ro.ts";
import ru from "./i18n/ru.ts";
import sk from "./i18n/sk.ts";
import sl from "./i18n/sl.ts";
import sq from "./i18n/sq.ts";
import sr from "./i18n/sr.ts";
import sv from "./i18n/sv.ts";
import ta from "./i18n/ta.ts";
import te from "./i18n/te.ts";
import th from "./i18n/th.ts";
import ti from "./i18n/ti.ts";
import tr from "./i18n/tr.ts";
import uk from "./i18n/uk.ts";
import ur from "./i18n/ur.ts";
import uz from "./i18n/uz.ts";
import vi from "./i18n/vi.ts";
import zh_Hans_CN from "./i18n/zh_Hans_CN.ts";
import zh_Hans_TW from "./i18n/zh_Hanst_TW.ts";

const LOCALES = {
  ...af,
  ...ar,
  ...az,
  ...bg,
  ...bn,
  ...cs,
  ...cy,
  ...da,
  ...de,
  ...el,
  ...en,
  ...es,
  ...et,
  ...fa,
  ...fi,
  ...fil,
  ...fr,
  ...ga,
  ...hi,
  ...hr,
  ...hu,
  ...id,
  ...is,
  ...it,
  ...ja,
  ...ka,
  ...kk,
  ...km,
  ...ko,
  ...lt,
  ...lv,
  ...ms,
  ...nl,
  ...pa,
  ...pl,
  ...pt,
  ...ro,
  ...ru,
  ...sk,
  ...sl,
  ...sq,
  ...sr,
  ...sv,
  ...ta,
  ...te,
  ...th,
  ...ti,
  ...tr,
  ...uk,
  ...ur,
  ...uz,
  ...vi,
  ...zh_Hans_CN,
  ...zh_Hans_TW,
};

export interface LocaleDictionary {
  helmet: {
    chat: string;
    purchase_history: string;
    appstore: string;
    folder: string;
    file: string;
    settings: string;
  };
  default_disks: {
    browser_cache: {
      title: string;
      public_note: string;
    };
    free_cloud_filesharing: {
      title: string;
      public_note: string;
    };
    folders: {
      root: string;
      throwaway: string;
      demo_gallery: string;
      tutorial_videos: string;
      trash: string;
    };
  };
  default_orgs: {
    offline_org: {
      org_name: string;
      profile_name: string;
    };
    anon_org: {
      org_name: string;
      profile_name: string;
    };
  };
  appstore: {
    input_placeholders: {
      search_mall: string;
      search_offers: string;
    };
    s3_offer: ServiceWithOffersFromVendors;
  };
}

export const fromLocale = () => {
  const locale = localStorage.getItem("lingo-locale") || "en";
  console.log(`the current locale is ${locale}`);
  console.log(
    `booked this`,
    // @ts-ignore
    LOCALES[locale]
  );
  // @ts-ignore
  return LOCALES[locale] as LocaleDictionary;
};

export const setLingoLocaleCookie = (locale: string) => {
  localStorage.setItem("lingo-locale", locale);
};
