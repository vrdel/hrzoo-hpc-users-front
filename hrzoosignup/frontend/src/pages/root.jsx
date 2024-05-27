import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LinkTitles } from 'Config/link-titles';
import { RequestTypesToSelect, UrlToRequestType } from 'Config/request-types';
import { ResourceTypesToSelect, ResourceTypesToSelectAdmin } from 'Config/resource-types';
import { listScientificDomain, mapDomainsToFields } from 'Config/scientific-domain';
import { buildOptionsFromArray } from 'Utils/select-tools';
import { AuthContextProvider } from 'Components/AuthContextProvider';
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

export const SharedData = React.createContext()


const getConfig = () => {
  const config = {
    cookie: {
      name: 'hzsi_cookie_consent',
    },

    guiOptions: {
      consentModal: {
        layout: 'bar inline',
        position: 'top',
        equalWeightButtons: false,
        flipButtons: false,
      },
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {}
    },

    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            description:
              'Web application use cookies to remember your language preferences and to manage your session for a seamless experience. By continuing to use our application, you accept our <a href="https://www.srce.unizg.hr/en/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>',
            acceptAllBtn: 'Accept',
          },
        },
      },
    },
  };

  return config;
};


const Root = () => {

  useEffect(() => {
    CookieConsent.run(getConfig());
  }, []);

  return (
    <SharedData.Provider value={{
      LinkTitles,
      RequestTypesToSelect,
      UrlToRequestType,
      ResourceTypesToSelect,
      ResourceTypesToSelectAdmin,
      listScientificDomain,
      mapDomainsToFields,
      buildOptionsFromArray,
    }}>
      <AuthContextProvider>
        <Outlet />
      </AuthContextProvider>
    </SharedData.Provider>
  )
};

export default Root;
