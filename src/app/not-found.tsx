import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-2">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">That page isn&apos;t in the workspace.</h1>
      <p className="mt-3 text-muted">Try the projects list or ask the AI assistant what you were looking for.</p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back home</Button>
        <Button href="/projects" variant="secondary">
          Projects
        </Button>
      </div>
    </div>
  );
}
