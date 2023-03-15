export default function ChatInput() {
  return (
    <div>
      <form className="flex items-center">
        <div className="w-full">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <input
            type="text"
            name="message"
            id="message"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Message"
          />
        </div>
        <button
          type="submit"
          className="mt-0 ml-3 inline-flex w-auto items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Send
        </button>
      </form>
      <div className="pb-2 lg:pb-4"></div>
    </div>
  );
}
