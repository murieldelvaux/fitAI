import * as React from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { RecommendationList } from '../components/recommendations/RecommendationList';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Recommendations() {
  const { recommendations, macroDeficit, isLoading, refetch } = useRecommendations();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Sugestões de Refeições Inteligentes
              </h2>
              <p className="text-sm text-slate-400">
                Nossa IA calcula os macros que faltam no seu dia e sugere refeições perfeitas para atingir suas metas.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="self-start sm:self-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar Sugestões
        </Button>
      </div>

      {/* Main recommendation list component */}
      <RecommendationList
        recommendations={recommendations}
        macroDeficit={macroDeficit}
        isLoading={isLoading}
      />
    </div>
  );
}
