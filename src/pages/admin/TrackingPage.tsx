import { useEffect, useState } from 'react';
import { Save, Tag, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

const GTM_PATTERN = /^GTM-[A-Z0-9]+$/;

export default function AdminTrackingPage() {
  const [gtmId, setGtmId] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('landing_tracking_config')
        .select('gtm_container_id')
        .maybeSingle();
      if (data?.gtm_container_id) setGtmId(data.gtm_container_id);
      setLoading(false);
    })();
  }, []);

  function handleChange(value: string) {
    setGtmId(value);
    setValidationError('');
    setSaveState('idle');
  }

  async function handleSave() {
    const trimmed = gtmId.trim();
    if (trimmed && !GTM_PATTERN.test(trimmed)) {
      setValidationError('Formato inválido. Use o padrão GTM-XXXXXXX.');
      return;
    }

    setSaveState('saving');
    const { error } = await supabase
      .from('landing_tracking_config')
      .upsert({ id: 1, gtm_container_id: trimmed || null }, { onConflict: 'id' });

    if (error) {
      setSaveState('error');
    } else {
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações de Rastreamento</h1>
        <p className="text-muted-foreground mt-1">
          Configure o Google Tag Manager para o site público do VitrineTurbo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4" />
            Google Tag Manager
          </CardTitle>
          <CardDescription>
            O snippet GTM será injetado automaticamente em todas as páginas públicas quando um
            Container ID válido estiver configurado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="gtm-id">Container ID</Label>
                <Input
                  id="gtm-id"
                  placeholder="GTM-XXXXXXX"
                  value={gtmId}
                  onChange={(e) => handleChange(e.target.value)}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationError}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Encontre o Container ID no painel do{' '}
                  <a
                    href="https://tagmanager.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 inline-flex items-center gap-0.5"
                  >
                    Google Tag Manager
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  . Deixe em branco para desativar.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={handleSave}
                  disabled={saveState === 'saving'}
                  className="gap-2"
                >
                  {saveState === 'saving' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar
                </Button>
                {saveState === 'success' && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Salvo com sucesso
                  </span>
                )}
                {saveState === 'error' && (
                  <span className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Erro ao salvar
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
