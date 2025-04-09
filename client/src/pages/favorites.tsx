import { useFavoritePrompts } from '@/hooks/use-prompts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Link } from 'wouter';
import { Bookmark } from 'lucide-react';
import { Prompt } from '@shared/schema';

export default function FavoritesPage() {
  const { data: favoritePrompts, isLoading, error } = useFavoritePrompts();

  if (isLoading) {
    return <LoadingSpinner size={40} text="Loading favorite prompts..." />;
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Favorites</h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : "Could not load favorites."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!favoritePrompts || favoritePrompts.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Bookmark className="mr-2 h-7 w-7" /> 
          Favorites
        </h1>
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't added any prompts to your favorites yet.
              </p>
              <Link href="/">
                <a className="text-primary hover:underline">
                  Go back to the home page to add some favorites.
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Bookmark className="mr-2 h-7 w-7" /> 
        Favorites
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favoritePrompts.map((prompt: Prompt) => (
          <Card key={prompt.id} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <Link href={`/prompt/${prompt.id}`} className="hover:text-primary">
                <CardTitle className="text-xl cursor-pointer">{prompt.title}</CardTitle>
              </Link>
              <p className="text-sm text-muted-foreground">
                {new Date(prompt.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-2 text-sm text-muted-foreground line-clamp-1">
                <span className="font-semibold">Prompt:</span> {prompt.prompt}
              </div>
              <p className="line-clamp-3 text-sm">
                {prompt.content.replace(/[#*`]/g, '').substring(0, 150)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}