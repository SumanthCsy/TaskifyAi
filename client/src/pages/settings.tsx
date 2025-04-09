import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Moon, Sun, Languages, Type } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("english");
  
  const { toast } = useToast();
  
  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["/api/preferences"],
  });
  
  // Update preferences on initial load
  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme || "dark");
      setFontSize(preferences.fontSize || "medium");
      setLanguage(preferences.language || "english");
    }
  }, [preferences]);
  
  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/preferences", data);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the preferences query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSaveSettings = () => {
    updatePreferences.mutate({
      theme,
      fontSize,
      language
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-start">
        <h1 className="text-3xl font-bold font-display">Settings</h1>
      </div>
      
      <Tabs defaultValue="appearance">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun size={16} /> Appearance
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Languages size={16} /> Language
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <SettingsIcon size={16} /> Privacy
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup 
                  value={theme} 
                  onValueChange={setTheme}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem 
                      value="dark" 
                      id="theme-dark" 
                      className="sr-only"
                    />
                    <Label
                      htmlFor="theme-dark"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${
                        theme === "dark" ? "border-primary" : "border-muted"
                      }`}
                    >
                      <Moon size={32} className="mb-2" />
                      <span>Dark</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="light" 
                      id="theme-light" 
                      className="sr-only"
                    />
                    <Label
                      htmlFor="theme-light"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${
                        theme === "light" ? "border-primary" : "border-muted"
                      }`}
                    >
                      <Sun size={32} className="mb-2" />
                      <span>Light</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="system" 
                      id="theme-system" 
                      className="sr-only"
                    />
                    <Label
                      htmlFor="theme-system"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${
                        theme === "system" ? "border-primary" : "border-muted"
                      }`}
                    >
                      <SettingsIcon size={32} className="mb-2" />
                      <span>System</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <RadioGroup 
                  value={fontSize} 
                  onValueChange={setFontSize}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="small"
                      id="font-small"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="font-small"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${
                        fontSize === "small" ? "border-primary" : "border-muted"
                      }`}
                    >
                      <Type size={24} className="mb-2" />
                      <span>Small</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="medium"
                      id="font-medium"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="font-medium"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${
                        fontSize === "medium" ? "border-primary" : "border-muted"
                      }`}
                    >
                      <Type size={32} className="mb-2" />
                      <span>Medium</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="large"
                      id="font-large"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="font-large"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:border-primary cursor-pointer ${
                        fontSize === "large" ? "border-primary" : "border-muted"
                      }`}
                    >
                      <Type size={40} className="mb-2" />
                      <span>Large</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-5">
              <p className="text-sm text-muted-foreground">
                Visual preferences are stored locally and will persist on this device.
              </p>
              <Button 
                onClick={handleSaveSettings}
                disabled={updatePreferences.isPending}
              >
                <Save size={16} className="mr-2" />
                {updatePreferences.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language-select">Display Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  This setting affects the application interface language.
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-5">
              <p className="text-sm text-muted-foreground">
                Language preferences are stored locally and will persist on this device.
              </p>
              <Button 
                onClick={handleSaveSettings}
                disabled={updatePreferences.isPending}
              >
                <Save size={16} className="mr-2" />
                {updatePreferences.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control how your data is stored and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5">
                  <Label>Save Search History</Label>
                  <p className="text-sm text-muted-foreground">
                    Store your recent searches for easier access
                  </p>
                </div>
                <Switch checked />
              </div>
              
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5">
                  <Label>Send Anonymous Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app with anonymous usage data
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between border-b pb-3">
                <div className="space-y-0.5">
                  <Label>Download History</Label>
                  <p className="text-sm text-muted-foreground">
                    Track which reports you have downloaded
                  </p>
                </div>
                <Switch checked />
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t pt-5">
              <p className="text-sm text-muted-foreground">
                Privacy preferences are stored locally and will persist on this device.
              </p>
              <Button 
                onClick={handleSaveSettings}
                disabled={updatePreferences.isPending}
              >
                <Save size={16} className="mr-2" />
                {updatePreferences.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
