import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Sparkles, Send, Lightbulb, Zap, Loader2 } from 'lucide-react';
import { useMealParse } from '../../hooks/useMealParse';

const QUICK_EXAMPLES = [
  'Comi 200g de frango grelhado com batata doce e azeite',
  '3 ovos mexidos com 2 fatias de pão integral e abacate',
  '1 scoop de whey protein com 1 banana e 40g de aveia',
  '180g de salmão grelhado com 150g de arroz integral e brócolis',
];

export function MealInputCard() {
  const [input, setInput] = React.useState('');
  const { parseAndLogAsync, isParsingAndLogging } = useMealParse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isParsingAndLogging) return;

    try {
      await parseAndLogAsync(input);
      setInput('');
    } catch {
      // Error handled inside hook with toast
    }
  };

  const handleSelectExample = (example: string) => {
    setInput(example);
  };

  return (
    <Card className="border-green-500/30 shadow-xl shadow-green-500/5 overflow-hidden relative bg-[#1E293B]">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Assistente Nutricional com IA</CardTitle>
              <CardDescription>
                Descreva sua refeição em linguagem natural — nossa IA detecta os alimentos, porções e macros automaticamente.
              </CardDescription>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
            <Zap className="w-3 h-3" /> FitAI 2.0
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Comi 200g de peito de frango grelhado com 150g de batata doce e 1 colher de azeite..."
              rows={3}
              disabled={isParsingAndLogging}
              className="bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-green-500 text-sm"
            />
          </div>

          {/* Quick suggestions chips */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Exemplos rápidos para testar:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_EXAMPLES.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectExample(example)}
                  disabled={isParsingAndLogging}
                  className="text-[11px] font-medium bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-green-300 border border-slate-800 hover:border-green-500/30 px-2.5 py-1 rounded-lg transition-all duration-150 text-left"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Pressione Enter ou clique em Registrar Refeição
            </span>

            <Button
              type="submit"
              disabled={!input.trim() || isParsingAndLogging}
              isLoading={isParsingAndLogging}
              className="px-5 font-semibold text-slate-950"
            >
              {isParsingAndLogging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Interpretando IA...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  Registrar Refeição
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
