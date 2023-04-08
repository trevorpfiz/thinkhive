import React from 'react';

const WordPressTango = () => {
  return (
    <div className="py-4 max-w-[708px] mx-auto">
      <h2 className="text-2xl font-medium mb-4">{`Adding an Expert to your WordPress site`}</h2>
      <div className="mx-auto h-[630px] max-w-[708px]">
        <iframe
          src="https://app.tango.us/app/embed/f11fdd3d-af47-4452-a0da-6863be663180?iframe=true"
          sandbox="allow-scripts allow-top-navigation-by-user-activation allow-popups allow-same-origin"
          security="restricted"
          title="WordPress: How to Add an Expert to Your Site"
          width="100%"
          height="100%"
          referrerPolicy="strict-origin-when-cross-origin"
          frameBorder="0"
          allowFullScreen
          className="h-full w-full border-none"
        />
      </div>
    </div>
  );
};

export default WordPressTango;
