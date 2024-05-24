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
    // root: 'body',
    // autoShow: true,
    // disablePageInteraction: true,
    // hideFromBots: true,
    // mode: 'opt-in',
    // revision: 0,

    cookie: {
      name: 'hzsi_cookie_consent',
      // domain: location.hostname,
      // path: '/',
      // sameSite: "Lax",
      // expiresAfterDays: 365,
    },

    /**
     * Callback functions
     */
    onFirstConsent: ({ cookie }) => {
      console.log('onFirstConsent fired', cookie);
    },

    onConsent: ({ cookie }) => {
      console.log('onConsent fired!', cookie);
    },

    onChange: ({ changedCategories, changedServices }) => {
      console.log('onChange fired!', changedCategories, changedServices);
    },

    onModalReady: ({ modalName }) => {
      console.log('ready:', modalName);
    },

    onModalShow: ({ modalName }) => {
      console.log('visible:', modalName);
    },

    onModalHide: ({ modalName }) => {
      console.log('hidden:', modalName);
    },

    // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
    guiOptions: {
      consentModal: {
        layout: 'bar inline',
        position: 'top',
        equalWeightButtons: false,
        flipButtons: true,
      },
    },

    categories: {
      necessary: {
        enabled: true, // this category is enabled by default
        readOnly: true, // this category cannot be disabled
      },
    },

    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'Cookie are used',
            description:
              'Web application uses cookies',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
          },
        },
      },
    },
  };

  return config;
};


const Root = () => {

  //useEffect(() => {
    //CookieConsent.run(getConfig());
  //}, []);

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
