export default function Messages() {
  return (
    <div>
      <div className="float-left clear-both">
        <div className="float-right mb-5 overflow-auto rounded-lg bg-white px-4 py-5 shadow-lg ring-1 ring-zinc-100 sm:px-6">
          <div className="flex space-x-3">
            <div className="flex-1 gap-4">
              <div className="prose text-black">
                <p>Hi! What can I help you with?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="float-right clear-both">
        <div className="float-right mb-5 overflow-auto rounded-lg bg-white px-4 py-5 shadow-lg ring-1 ring-zinc-100 sm:px-6">
          <div className="flex space-x-3">
            <div className="flex-1 gap-4">
              <div className="prose text-black">
                <p>What is the cause of allergies?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
