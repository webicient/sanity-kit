"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import React, { createContext, useContext, ReactNode } from "react";
import PageView from "./analytics/PageView";

interface KitContextProps {
  settings: Record<string, any>;
}

const KitContext = createContext<KitContextProps | undefined>(undefined);

interface KitProviderProps {
  children: ReactNode;
  settings: Record<string, any>;
}

export const KitProvider: React.FC<KitProviderProps> = ({
  children,
  settings,
}) => {
  const { scriptsSettings, integrationSettings } = settings;

  return (
    <KitContext.Provider value={{ settings }}>
      {/* Marker */}
      {integrationSettings?.markerId && (
        <Script
          id="marker-io"
          dangerouslySetInnerHTML={{
            __html: `window.markerConfig = {
            project: '${integrationSettings?.markerId}',
            source: 'snippet'
          };
          !function(e,r,a){if(!e.__Marker){e.__Marker={};var t=[],n={__cs:t};["show","hide","isVisible","capture","cancelCapture","unload","reload","isExtensionInstalled","setReporter","setCustomData","on","off"].forEach(function(e){n[e]=function(){var r=Array.prototype.slice.call(arguments);r.unshift(e),t.push(r)}}),e.Marker=n;var s=r.createElement("script");s.async=1,s.src="https://edge.marker.io/latest/shim.js";var i=r.getElementsByTagName("script")[0];i.parentNode.insertBefore(s,i)}}(window,document);`,
          }}
        />
      )}
      {/* Google Tag Manager */}
      {integrationSettings?.gtmId && (
        <>
          <GoogleTagManager gtmId={integrationSettings?.gtmId} />
          {/* Tracking page view */}
          <PageView />
        </>
      )}
      {/* Custom scripts inside head. */}
      {scriptsSettings?.head && (
        <Script
          id="headScript"
          dangerouslySetInnerHTML={{
            __html: `${scriptsSettings.head}`,
          }}
        />
      )}
      {/* Custom scripts after body opens. */}
      {scriptsSettings?.preBody && (
        <script
          id="preBodyScript"
          dangerouslySetInnerHTML={{
            __html: `${scriptsSettings.preBody}`,
          }}
        />
      )}
      {children}
      {/* Custom scripts before body closes. */}
      {scriptsSettings?.postBody && (
        <script
          id="postBodyScript"
          dangerouslySetInnerHTML={{
            __html: `${scriptsSettings.postBody}`,
          }}
        />
      )}
    </KitContext.Provider>
  );
};

export const useKit = (): KitContextProps => {
  const context = useContext(KitContext);
  if (context === undefined) {
    throw new Error("useKit must be used within a KitProvider.");
  }
  return context;
};
