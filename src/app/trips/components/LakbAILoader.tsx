const LakbAILoader = () => {
  return (
    <section
      className="fixed inset-0 bg-slate-800/30 backdrop-blur-sm flex justify-center items-center"
      style={{ zIndex: 99 }}
    >
      <div className="p-10 space-x-6 rounded-2xl bg-card border flex justify-center items-center">
        <span className="text-5xl animate-spin">🐸</span>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">
            LakbAI is crafting your next adventure..
          </h3>
          <p className="text-xs text-foreground/70 font-semibold">
            Note: This should not take longer than 20 seconds.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LakbAILoader;
