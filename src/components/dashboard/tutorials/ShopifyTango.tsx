import React from 'react';

const ShopifyTango = () => {
  return (
    <div className="py-4 max-w-[708px] mx-auto">
      <h2 className="text-2xl font-medium mb-4">{`Adding an Assistant to your Shopify store`}</h2>
      <div className="mx-auto h-[630px] max-w-[708px]">
        <iframe
          src="https://app.tango.us/app/embed/84432f9f-2215-422a-9344-10d82c1a9741?iframe=true"
          sandbox="allow-scripts allow-top-navigation-by-user-activation allow-popups allow-same-origin"
          security="restricted"
          title="Shopify: How to Add an Assistant to Your Store"
          width="100%"
          height="100%"
          referrerPolicy="strict-origin-when-cross-origin"
          frameBorder="0"
          allow="fullscreen"
          className="h-full w-full border-none"
        />
      </div>
    </div>
  );
};

export default ShopifyTango;
