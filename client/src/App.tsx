import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";
import NotificationBanner from "@/components/layout/notification-banner";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import { motion } from "framer-motion";

// New page imports for our restructured app
import PromptView from "@/pages/prompt-view";
import FavoritesPage from "@/pages/favorites";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <NotificationBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto py-6 px-4 md:px-6"
          >
            {children}
          </motion.div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <Layout>
            <Home />
          </Layout>
        )}
      </Route>
      <Route path="/prompt/:id">
        {(params) => (
          <Layout>
            <PromptView id={parseInt(params.id)} />
          </Layout>
        )}
      </Route>
      <Route path="/favorites">
        {() => (
          <Layout>
            <FavoritesPage />
          </Layout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <Layout>
            <Settings />
          </Layout>
        )}
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
