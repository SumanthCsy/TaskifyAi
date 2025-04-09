import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="bg-gradient-to-br from-primary to-purple-500 h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="text-sm font-semibold">Taskify AI</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Taskify AI. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/search">
              <a className="text-sm text-muted-foreground hover:text-foreground transition duration-200">
                Search
              </a>
            </Link>
            <Link href="/history">
              <a className="text-sm text-muted-foreground hover:text-foreground transition duration-200">
                History
              </a>
            </Link>
            <Link href="/settings">
              <a className="text-sm text-muted-foreground hover:text-foreground transition duration-200">
                Settings
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
