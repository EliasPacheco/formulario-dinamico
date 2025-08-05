'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { formularioCompletoService, respostaFormularioService, condicaoPerguntaService } from '../../lib/services';
import { FormularioCompleto, CondicaoPergunta } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Checkbox from '../ui/Checkbox';
import { useRouter } from 'next/navigation';

interface FormViewerProps {
  formularioId: string;
}

interface FormResponse {
  [perguntaId: string]: any;
}

const FormViewer: React.FC<FormViewerProps> = ({ formularioId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formulario, setFormulario] = useState<FormularioCompleto | null>(null);
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [condicoes, setCondicoes] = useState<CondicaoPergunta[]>([]);

  useEffect(() => {
    loadFormulario();
  }, [formularioId]);

  const loadFormulario = async () => {
    try {
      setLoading(true);
      console.log('Carregando formulário com ID:', formularioId);
      const data = await formularioCompletoService.getById(formularioId);
      console.log('Dados do formulário carregados:', data);
      setFormulario(data);

      // Carregar condições de perguntas
      if (data) {
        const todasCondicoes: CondicaoPergunta[] = [];
        for (const pergunta of data.perguntas) {
          const condicoesPergunta = await condicaoPerguntaService.getByPerguntaDestino(pergunta.id);
          todasCondicoes.push(...condicoesPergunta);
        }
        setCondicoes(todasCondicoes);
      }
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (perguntaId: string, value: any) => {
    setResponses(prev => ({ ...prev, [perguntaId]: value }));
    // Clear error when user starts typing
    if (errors[perguntaId]) {
      setErrors(prev => ({ ...prev, [perguntaId]: '' }));
    }
  };

  // Função para verificar se uma pergunta deve ser exibida baseada nas condições
  const shouldShowPergunta = (pergunta: FormularioCompleto['perguntas'][0]): boolean => {
    const condicoesPergunta = condicoes.filter(c => c.id_pergunta_destino === pergunta.id);
    
    if (condicoesPergunta.length === 0) {
      return true; // Sem condições, sempre exibir
    }

    // Verificar se pelo menos uma condição é atendida
    return condicoesPergunta.some(condicao => {
      const respostaOrigem = responses[condicao.id_pergunta_origem];
      if (!respostaOrigem) return false;

      // Encontrar a opção de resposta que ativa esta condição
      const perguntaOrigem = formulario?.perguntas.find(p => p.id === condicao.id_pergunta_origem);
      const opcaoAtivadora = perguntaOrigem?.opcoes_respostas.find(op => op.id === condicao.id_opcao_resposta);
      
      if (!opcaoAtivadora) return false;

      // Verificar se a resposta atual corresponde à opção que ativa a condição
      if (Array.isArray(respostaOrigem)) {
        return respostaOrigem.includes(opcaoAtivadora.resposta);
      } else {
        return respostaOrigem === opcaoAtivadora.resposta;
      }
    });
  };

  const validateForm = (): boolean => {
    if (!formulario) return false;

    const newErrors: { [key: string]: string } = {};

    formulario.perguntas.forEach(pergunta => {
      // Só validar perguntas que estão sendo exibidas
      if (shouldShowPergunta(pergunta) && pergunta.obrigatoria) {
        const response = responses[pergunta.id];
        if (!response || (Array.isArray(response) && response.length === 0) || (typeof response === 'string' && !response.trim())) {
          newErrors[pergunta.id] = 'Esta pergunta é obrigatória';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Preparar respostas para envio
      const respostasParaEnviar = Object.entries(responses).map(([perguntaId, resposta]) => {
        const pergunta = formulario?.perguntas.find(p => p.id === perguntaId);
        return {
          id_pergunta: perguntaId,
          resposta: resposta,
          tipo_pergunta: pergunta?.tipo_pergunta || '',
        };
      });

      // Salvar no Firebase
      await respostaFormularioService.create({
        id_formulario: formularioId,
        respostas: respostasParaEnviar,
      });
      
      alert('Formulário enviado com sucesso!');
      router.push('/formularios');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar formulário');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPergunta = (pergunta: FormularioCompleto['perguntas'][0]) => {
    const response = responses[pergunta.id];
    const error = errors[pergunta.id];

    const commonProps = {
      error,
      key: pergunta.id,
    };

    switch (pergunta.tipo_pergunta) {
      case 'texto_livre':
        return (
          <Textarea
            {...commonProps}
            label={pergunta.titulo}
            value={response || ''}
            onChange={(e) => handleResponseChange(pergunta.id, e.target.value)}
            placeholder="Digite sua resposta"
            rows={3}
          />
        );

      case 'Inteiro':
        return (
          <Input
            {...commonProps}
            label={pergunta.titulo}
            type="number"
            value={response || ''}
            onChange={(e) => handleResponseChange(pergunta.id, parseInt(e.target.value) || '')}
            placeholder="Digite um número inteiro"
          />
        );

      case 'Numero com duas casa decimais':
        return (
          <Input
            {...commonProps}
            label={pergunta.titulo}
            type="number"
            step="0.01"
            value={response || ''}
            onChange={(e) => handleResponseChange(pergunta.id, parseFloat(e.target.value) || '')}
            placeholder="Digite um número decimal"
          />
        );

      case 'Sim_Não':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {pergunta.titulo}
              {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`flex gap-4 ${pergunta.orientacao_resposta === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
              {['Sim', 'Não'].map((opcao) => (
                <label key={opcao} className="flex items-center">
                  <input
                    type="radio"
                    name={pergunta.id}
                    value={opcao}
                    checked={response === opcao}
                    onChange={(e) => handleResponseChange(pergunta.id, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{opcao}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'unica_escolha':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {pergunta.titulo}
              {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`flex gap-4 ${pergunta.orientacao_resposta === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
              {pergunta.opcoes_respostas.map((opcao) => (
                <label key={opcao.id} className="flex items-center">
                  <input
                    type="radio"
                    name={pergunta.id}
                    value={opcao.resposta}
                    checked={response === opcao.resposta}
                    onChange={(e) => handleResponseChange(pergunta.id, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{opcao.resposta}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'multimpla_escola':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {pergunta.titulo}
              {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={`flex gap-4 ${pergunta.orientacao_resposta === 'horizontal' ? 'flex-row' : 'flex-col'}`}>
              {pergunta.opcoes_respostas.map((opcao) => (
                <label key={opcao.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={opcao.resposta}
                    checked={Array.isArray(response) && response.includes(opcao.resposta)}
                    onChange={(e) => {
                      const currentResponses = Array.isArray(response) ? response : [];
                      if (e.target.checked) {
                        handleResponseChange(pergunta.id, [...currentResponses, opcao.resposta]);
                      } else {
                        handleResponseChange(pergunta.id, currentResponses.filter(r => r !== opcao.resposta));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{opcao.resposta}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formulario) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Formulário não encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          O formulário que você está procurando não existe.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          ID do formulário: {formularioId}
        </p>
        <Button
          onClick={() => router.push('/formularios')}
          className="mt-4"
        >
          Voltar para Formulários
        </Button>
      </div>
    );
  }

  // Filtrar perguntas que devem ser exibidas
  const perguntasVisiveis = formulario.perguntas.filter(pergunta => shouldShowPergunta(pergunta));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/formularios')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{formulario.titulo}</h1>
          {formulario.descricao && (
            <p className="text-gray-600">{formulario.descricao}</p>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          {perguntasVisiveis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Este formulário não possui perguntas visíveis.</p>
            </div>
          ) : (
            perguntasVisiveis.map((pergunta, index) => (
              <div key={pergunta.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                {renderPergunta(pergunta)}
              </div>
            ))
          )}

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              loading={submitting}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar Formulário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormViewer; 