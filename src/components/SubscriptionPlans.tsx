
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PlanFeature = ({ included, children }: { included: boolean; children: React.ReactNode }) => (
  <div className="flex items-center space-x-2">
    {included ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={included ? "text-foreground" : "text-muted-foreground"}>{children}</span>
  </div>
);

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (plan: string) => {
    setLoading(true);
    toast.info(`Prochainement: Abonnement ${plan}. Cette fonctionnalité est en cours de développement.`);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Plans d'abonnement</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choisissez le plan qui correspond à vos besoins. Tous les plans incluent un accès à toutes les fonctionnalités de base.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between">
              <span>Gratuit</span>
              <span className="text-3xl font-bold">0€</span>
            </CardTitle>
            <CardDescription>Pour une utilisation personnelle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <PlanFeature included={true}>Notes illimitées</PlanFeature>
            <PlanFeature included={true}>Fonctionnalités de base</PlanFeature>
            <PlanFeature included={true}>Transcription vocale limitée</PlanFeature>
            <PlanFeature included={false}>Assistant IA avancé</PlanFeature>
            <PlanFeature included={false}>Stockage étendu</PlanFeature>
            <PlanFeature included={false}>Support prioritaire</PlanFeature>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Plan actuel
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-primary shadow-md relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
            Populaire
          </div>
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between">
              <span>Premium</span>
              <div className="text-right">
                <span className="text-3xl font-bold">9,99€</span>
                <span className="text-xs block text-muted-foreground">/mois</span>
              </div>
            </CardTitle>
            <CardDescription>Pour les utilisateurs exigeants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <PlanFeature included={true}>Notes illimitées</PlanFeature>
            <PlanFeature included={true}>Fonctionnalités avancées</PlanFeature>
            <PlanFeature included={true}>Transcription vocale illimitée</PlanFeature>
            <PlanFeature included={true}>Assistant IA avancé</PlanFeature>
            <PlanFeature included={true}>10 Go de stockage</PlanFeature>
            <PlanFeature included={false}>Support prioritaire</PlanFeature>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("premium")} disabled={loading}>
              {loading ? "Chargement..." : "S'abonner"}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle className="flex items-baseline justify-between">
              <span>Entreprise</span>
              <div className="text-right">
                <span className="text-3xl font-bold">24,99€</span>
                <span className="text-xs block text-muted-foreground">/mois</span>
              </div>
            </CardTitle>
            <CardDescription>Pour les équipes et professionnels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <PlanFeature included={true}>Notes illimitées</PlanFeature>
            <PlanFeature included={true}>Toutes les fonctionnalités</PlanFeature>
            <PlanFeature included={true}>Transcription vocale illimitée</PlanFeature>
            <PlanFeature included={true}>Assistant IA ultra performant</PlanFeature>
            <PlanFeature included={true}>50 Go de stockage</PlanFeature>
            <PlanFeature included={true}>Support prioritaire 24/7</PlanFeature>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => handleSubscribe("enterprise")} disabled={loading}>
              {loading ? "Chargement..." : "S'abonner"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
