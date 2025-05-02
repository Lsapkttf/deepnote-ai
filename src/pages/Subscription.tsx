
import { useState } from "react";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Subscription = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dans une véritable implémentation, ces données viendraient de l'API Stripe
  const subscriptionStatus = "free"; // Pourrait être 'free', 'premium', 'enterprise'
  const subscriptionEnd = null; // Date de fin d'abonnement si applicable

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Abonnement</h1>
        </div>
      </div>

      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="plans" className="flex-1">
              <CreditCard className="mr-2 h-4 w-4" />
              Plans d'abonnement
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex-1">
              <Receipt className="mr-2 h-4 w-4" />
              Facturation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="w-full">
            <SubscriptionPlans />
          </TabsContent>

          <TabsContent value="billing" className="w-full">
            <div className="max-w-3xl mx-auto py-8">
              <div className="bg-muted/50 border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">État de l'abonnement</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan actuel</span>
                    <span className="font-medium capitalize">
                      {subscriptionStatus === "free" ? "Gratuit" : 
                       subscriptionStatus === "premium" ? "Premium" :
                       subscriptionStatus === "enterprise" ? "Entreprise" : "Non abonné"}
                    </span>
                  </div>
                  {subscriptionEnd && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prochaine facturation</span>
                      <span className="font-medium">{new Date(subscriptionEnd).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compte</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg divide-y">
                <h3 className="text-lg font-medium p-6">Historique de facturation</h3>
                
                <div className="p-6 text-center text-muted-foreground">
                  Aucune facture disponible
                </div>
                
                {/* Une fois l'intégration Stripe complétée, cette section affichera l'historique des factures */}
                {/* 
                <div className="p-6 flex justify-between">
                  <div>
                    <p className="font-medium">Premium - Mensuel</p>
                    <p className="text-sm text-muted-foreground">10 mai 2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">9,99€</p>
                    <Button variant="link" size="sm" className="h-auto p-0">Télécharger</Button>
                  </div>
                </div>
                */}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Subscription;
