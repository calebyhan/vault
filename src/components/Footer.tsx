import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Made by Caleb Han
          </p>
          <a
            href="https://github.com/calebyhan/vault"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
