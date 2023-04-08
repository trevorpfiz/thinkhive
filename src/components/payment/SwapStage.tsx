import React, { useState } from 'react';
import { useSetAtom } from 'jotai';

import { modalStageAtom, swapImmediatelyAtom } from './SubscribeButton';

const timeframes = [
  { id: 'delayed', title: 'Swap at end of subscription period', swapImmediately: false },
  { id: 'immediately', title: 'Swap immediately with proration', swapImmediately: true },
];

interface Timeframe {
  id: string;
  title: string;
  swapImmediately: boolean;
}

export default function SwapStage() {
  const setModalStage = useSetAtom(modalStageAtom);
  const setSwapImmediately = useSetAtom(swapImmediatelyAtom);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(timeframes[0]!);

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSwapImmediately(selectedTimeframe.swapImmediately);
    setModalStage(selectedTimeframe.swapImmediately ? 3 : 2);
  };

  const handleRadioChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <div>
      <label className="text-base font-semibold text-gray-900">Choose your timeframe</label>
      <p className="text-sm text-gray-500">{`Changing plan now will prorate your unused credits, crediting them towards the next month's cost.`}</p>
      <form onSubmit={handleNext}>
        {/* ... rest of the content */}
        <fieldset className="mt-4">
          <legend className="sr-only">Choose your timeframe</legend>
          <div className="space-y-4">
            {timeframes.map((timeframe) => (
              <label key={timeframe.id} className="flex cursor-pointer items-center">
                <input
                  id={timeframe.id}
                  name="timeframe"
                  type="radio"
                  checked={selectedTimeframe.id === timeframe.id}
                  onChange={() => handleRadioChange(timeframe)}
                  className="h-4 w-4 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <span className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                  {timeframe.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
          >
            Next
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={() => setModalStage(0)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
