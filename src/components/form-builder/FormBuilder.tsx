'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Settings, Eye, Link } from 'lucide-react';
import { formularioService, perguntaService, opcaoRespostaService, condicaoService, condicaoPerguntaService } from '../../lib/services';
import { Formulario, Pergunta, OpcaoResposta, TipoPergunta, OrientacaoResposta, CondicaoPergunta } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Checkbox from '../ui/Checkbox';
import { useRouter } from 'next/navigation';

interface FormBuilderProps {
  formularioId?: string;
  isEditing?: boolean;
}

const TIPO_PERGUNTA_OPTIONS = [
  { value: 'Sim_Não', label: 'Sim/Não' },
  { value: 'multimpla_escola', label: 'Múltipla Escolha' },
  { value: 'unica_escolha', label: 'Única Escolha' },
  { value: 'texto_livre', label: 'Texto Livre' },
  { value: 'Inteiro', label: 'Número Inteiro' },
  { value: 'Numero com duas casa decimais', label: 'Número com Duas Casas Decimais' },
];

const ORIENTACAO_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

const FormBuilder: React.FC<FormBuilderProps> = ({ formularioId, isEditing = false }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formulario, setFormulario] = useState<Partial<Formulario>>({
    titulo: '',
    descricao: '',
    ordem: 1,
  });
  const [perguntas, setPerguntas] = useState<(Pergunta & { opcoes_respostas: OpcaoResposta[] })[]>([]);
  const [expandedPergunta, setExpandedPergunta] = useState<string | null>(null);
  const [condicoes, setCondicoes] = useState<CondicaoPergunta[]>([]);
  const [showCondicoesModal, setShowCondicoesModal] = useState<string | null>(null);

  useEffect(() => {
    if (formularioId && isEditing) {
      loadFormulario();
    }
  }, [formularioId, isEditing]);

  const loadFormulario = async () => {
    if (!formularioId) return;
    
    try {
      setLoading(true);
      console.log('Carregando formulário para edição com ID:', formularioId);
      
      const formularioData = await formularioService.getById(formularioId);
      console.log('Dados do formulário carregados:', formularioData);
      
      if (formularioData) {
        setFormulario(formularioData);
        
        const perguntasData = await perguntaService.getByFormularioId(formularioId);
        console.log('Perguntas carregadas:', perguntasData);
        
        const perguntasCompletas = await Promise.all(
          perguntasData.map(async (pergunta) => {
            const opcoes = await opcaoRespostaService.getByPerguntaId(pergunta.id);
            console.log(`Opções para pergunta ${pergunta.id}:`, opcoes);
            return { ...pergunta, opcoes_respostas: opcoes };
          })
        );
        
        console.log('Perguntas completas carregadas:', perguntasCompletas);
        setPerguntas(perguntasCompletas);

        // Carregar condições
        const todasCondicoes: CondicaoPergunta[] = [];
        for (const pergunta of perguntasCompletas) {
          const condicoesPergunta = await condicaoPerguntaService.getByPerguntaDestino(pergunta.id);
          todasCondicoes.push(...condicoesPergunta);
        }
        setCondicoes(todasCondicoes);
      } else {
        console.log('Formulário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormularioChange = (field: keyof Formulario, value: any) => {
    setFormulario(prev => ({ ...prev, [field]: value }));
  };

  const addPergunta = () => {
    const novaPergunta: Pergunta & { opcoes_respostas: OpcaoResposta[] } = {
      id: `temp-${Date.now()}`,
      id_formulario: formularioId || '',
      titulo: '',
      codigo: '',
      orientacao_resposta: 'vertical',
      ordem: perguntas.length + 1,
      obrigatoria: false,
      sub_pergunta: false,
      tipo_pergunta: 'texto_livre',
      createdAt: new Date(),
      updatedAt: new Date(),
      opcoes_respostas: [],
    };
    setPerguntas(prev => [...prev, novaPergunta]);
    setExpandedPergunta(novaPergunta.id);
  };

  const updatePergunta = (id: string, field: keyof Pergunta, value: any) => {
    setPerguntas(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const removePergunta = (id: string) => {
    setPerguntas(prev => prev.filter(p => p.id !== id));
    // Remover condições relacionadas
    setCondicoes(prev => prev.filter(c => c.id_pergunta_destino !== id && c.id_pergunta_origem !== id));
  };

  const addOpcaoResposta = (perguntaId: string) => {
    const novaOpcao: OpcaoResposta = {
      id: `temp-${Date.now()}`,
      id_pergunta: perguntaId,
      resposta: '',
      ordem: perguntas.find(p => p.id === perguntaId)?.opcoes_respostas.length || 0,
      resposta_aberta: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPerguntas(prev => 
      prev.map(p => 
        p.id === perguntaId 
          ? { ...p, opcoes_respostas: [...p.opcoes_respostas, novaOpcao] }
          : p
      )
    );
  };

  const updateOpcaoResposta = (perguntaId: string, opcaoId: string, field: keyof OpcaoResposta, value: any) => {
    setPerguntas(prev => 
      prev.map(p => 
        p.id === perguntaId 
          ? {
              ...p,
              opcoes_respostas: p.opcoes_respostas.map(op => 
                op.id === opcaoId ? { ...op, [field]: value } : op
              )
            }
          : p
      )
    );
  };

  const removeOpcaoResposta = (perguntaId: string, opcaoId: string) => {
    setPerguntas(prev => 
      prev.map(p => 
        p.id === perguntaId 
          ? { ...p, opcoes_respostas: p.opcoes_respostas.filter(op => op.id !== opcaoId) }
          : p
      )
    );
  };

  // Funções para gerenciar condições
  const addCondicao = (perguntaDestinoId: string, perguntaOrigemId: string, opcaoRespostaId: string) => {
    const novaCondicao: CondicaoPergunta = {
      id: `temp-${Date.now()}`,
      id_pergunta_origem: perguntaOrigemId,
      id_opcao_resposta: opcaoRespostaId,
      id_pergunta_destino: perguntaDestinoId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCondicoes(prev => [...prev, novaCondicao]);
  };

  const removeCondicao = (condicaoId: string) => {
    setCondicoes(prev => prev.filter(c => c.id !== condicaoId));
  };

  const getCondicoesPergunta = (perguntaId: string) => {
    return condicoes.filter(c => c.id_pergunta_destino === perguntaId);
  };



  const handleSave = async () => {
    if (!formulario.titulo?.trim()) {
      alert('Por favor, informe o título do formulário');
      return;
    }

    try {
      setSaving(true);
      
      let formularioIdToUse = formularioId;
      
      if (!formularioIdToUse) {
        // Criar novo formulário
        formularioIdToUse = await formularioService.create({
          titulo: formulario.titulo!,
          descricao: formulario.descricao || '',
          ordem: formulario.ordem || 1,
        });
      } else {
        // Atualizar formulário existente
        await formularioService.update(formularioIdToUse, {
          titulo: formulario.titulo,
          descricao: formulario.descricao,
          ordem: formulario.ordem,
        });
      }

      // Salvar perguntas
      for (const pergunta of perguntas) {
        if (pergunta.titulo.trim()) {
          let perguntaId = pergunta.id;
          
          if (pergunta.id.startsWith('temp-')) {
            // Criar nova pergunta
            perguntaId = await perguntaService.create({
              id_formulario: formularioIdToUse,
              titulo: pergunta.titulo,
              codigo: pergunta.codigo,
              orientacao_resposta: pergunta.orientacao_resposta,
              ordem: pergunta.ordem,
              obrigatoria: pergunta.obrigatoria,
              sub_pergunta: pergunta.sub_pergunta,
              tipo_pergunta: pergunta.tipo_pergunta,
            });
          } else {
            // Atualizar pergunta existente
            await perguntaService.update(perguntaId, {
              titulo: pergunta.titulo,
              codigo: pergunta.codigo,
              orientacao_resposta: pergunta.orientacao_resposta,
              ordem: pergunta.ordem,
              obrigatoria: pergunta.obrigatoria,
              sub_pergunta: pergunta.sub_pergunta,
              tipo_pergunta: pergunta.tipo_pergunta,
            });
          }

          // Salvar opções de resposta
          for (const opcao of pergunta.opcoes_respostas) {
            if (opcao.resposta.trim()) {
              if (opcao.id.startsWith('temp-')) {
                await opcaoRespostaService.create({
                  id_pergunta: perguntaId,
                  resposta: opcao.resposta,
                  ordem: opcao.ordem,
                  resposta_aberta: opcao.resposta_aberta,
                });
              } else {
                await opcaoRespostaService.update(opcao.id, {
                  resposta: opcao.resposta,
                  ordem: opcao.ordem,
                  resposta_aberta: opcao.resposta_aberta,
                });
              }
            }
          }
        }
      }

      // Salvar condições
      for (const condicao of condicoes) {
        if (condicao.id.startsWith('temp-')) {
          await condicaoPerguntaService.create({
            id_pergunta_origem: condicao.id_pergunta_origem,
            id_opcao_resposta: condicao.id_opcao_resposta,
            id_pergunta_destino: condicao.id_pergunta_destino,
          });
        }
      }

      router.push('/formularios');
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      alert('Erro ao salvar formulário');
    } finally {
      setSaving(false);
    }
  };

  const needsOptions = (tipo: TipoPergunta) => {
    return ['multimpla_escola', 'unica_escolha', 'Sim_Não'].includes(tipo);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Formulário' : 'Novo Formulário'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/formularios')}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
          >
            Salvar Formulário
          </Button>
        </div>
      </div>

      {/* Informações do Formulário */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Formulário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título *"
            value={formulario.titulo || ''}
            onChange={(e) => handleFormularioChange('titulo', e.target.value)}
            placeholder="Digite o título do formulário"
          />
          <Input
            label="Ordem"
            type="number"
            value={formulario.ordem?.toString() || '1'}
            onChange={(e) => handleFormularioChange('ordem', parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Descrição"
            value={formulario.descricao || ''}
            onChange={(e) => handleFormularioChange('descricao', e.target.value)}
            placeholder="Digite a descrição do formulário"
            rows={3}
          />
        </div>
      </div>

      {/* Perguntas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Perguntas</h2>
          <Button
            onClick={addPergunta}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Pergunta
          </Button>
        </div>

        <div className="space-y-4">
          {perguntas.map((pergunta, index) => (
            <div
              key={pergunta.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">Pergunta {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedPergunta(
                    expandedPergunta === pergunta.id ? null : pergunta.id
                  )}
                  className="ml-auto"
                >
                  {expandedPergunta === pergunta.id ? <Settings className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePergunta(pergunta.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Título da Pergunta *"
                  value={pergunta.titulo}
                  onChange={(e) => updatePergunta(pergunta.id, 'titulo', e.target.value)}
                  placeholder="Digite a pergunta"
                />
                <Input
                  label="Código"
                  value={pergunta.codigo}
                  onChange={(e) => updatePergunta(pergunta.id, 'codigo', e.target.value)}
                  placeholder="Código interno"
                />
              </div>

              {expandedPergunta === pergunta.id && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Tipo de Pergunta"
                      options={TIPO_PERGUNTA_OPTIONS}
                      value={pergunta.tipo_pergunta}
                      onChange={(value) => updatePergunta(pergunta.id, 'tipo_pergunta', value as TipoPergunta)}
                    />
                    <Select
                      label="Orientação"
                      options={ORIENTACAO_OPTIONS}
                      value={pergunta.orientacao_resposta}
                      onChange={(value) => updatePergunta(pergunta.id, 'orientacao_resposta', value as OrientacaoResposta)}
                    />
                    <div className="flex items-end">
                      <Input
                        label="Ordem"
                        type="number"
                        value={pergunta.ordem.toString()}
                        onChange={(e) => updatePergunta(pergunta.id, 'ordem', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Checkbox
                      label="Pergunta obrigatória"
                      checked={pergunta.obrigatoria}
                      onChange={(checked) => updatePergunta(pergunta.id, 'obrigatoria', checked)}
                    />
                    <Checkbox
                      label="Sub-pergunta"
                      checked={pergunta.sub_pergunta}
                      onChange={(checked) => updatePergunta(pergunta.id, 'sub_pergunta', checked)}
                    />
                  </div>

                  {/* Opções de Resposta */}
                  {needsOptions(pergunta.tipo_pergunta) && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-medium text-gray-900">Opções de Resposta</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOpcaoResposta(pergunta.id)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          Adicionar Opção
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {pergunta.opcoes_respostas.map((opcao, opcaoIndex) => (
                          <div key={opcao.id} className="flex items-center gap-2">
                            <Input
                              value={opcao.resposta}
                              onChange={(e) => updateOpcaoResposta(pergunta.id, opcao.id, 'resposta', e.target.value)}
                              placeholder={`Opção ${opcaoIndex + 1}`}
                              className="flex-1"
                            />
                            <Checkbox
                              label="Resposta aberta"
                              checked={opcao.resposta_aberta}
                              onChange={(checked) => updateOpcaoResposta(pergunta.id, opcao.id, 'resposta_aberta', checked)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOpcaoResposta(pergunta.id, opcao.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

                            {/* Modal de Condições */}
              {showCondicoesModal === pergunta.id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Configurar Condições - Pergunta: {pergunta.titulo}</h3>
                                             <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setShowCondicoesModal(null)}
                         className="text-gray-500 hover:text-gray-700"
                       >
                         ✕
                       </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Configure quando esta pergunta deve ser exibida baseada em outras respostas.
                    </p>

                    <div className="space-y-4">
                      {/* Condições Existentes */}
                      {getCondicoesPergunta(pergunta.id).length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Condições Atuais:</h4>
                          {getCondicoesPergunta(pergunta.id).map((condicao) => {
                            const perguntaOrigem = perguntas.find(p => p.id === condicao.id_pergunta_origem);
                            const opcaoResposta = perguntaOrigem?.opcoes_respostas.find(op => op.id === condicao.id_opcao_resposta);
                            
                            return (
                              <div key={condicao.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">
                                  Se "{perguntaOrigem?.titulo || 'Pergunta não encontrada'}" = "{opcaoResposta?.resposta || 'Opção não encontrada'}"
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCondicao(condicao.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Nenhuma condição configurada</p>
                          <p className="text-xs mt-1">Esta pergunta será sempre exibida</p>
                        </div>
                      )}

                      {/* Adicionar Nova Condição */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Adicionar Nova Condição</h4>
                        
                        {(() => {
                          const perguntasComOpcoes = perguntas.filter(p => 
                            p.id !== pergunta.id && 
                            needsOptions(p.tipo_pergunta) && 
                            p.opcoes_respostas.length > 0 &&
                            p.titulo.trim() !== ''
                          );
                          
                          if (perguntasComOpcoes.length === 0) {
                            return (
                              <div className="text-center py-4 text-gray-500">
                                <p>Nenhuma pergunta disponível para condição</p>
                                <p className="text-xs mt-1">Adicione perguntas com opções (Sim/Não, Múltipla Escolha, etc.) primeiro</p>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="space-y-2">
                              <Select
                                label="Pergunta de origem"
                                options={perguntasComOpcoes.map(p => ({
                                  value: p.id,
                                  label: p.titulo
                                }))}
                                value=""
                                onChange={(perguntaOrigemId) => {
                                  const perguntaOrigem = perguntas.find(p => p.id === perguntaOrigemId);
                                  if (perguntaOrigem && perguntaOrigem.opcoes_respostas.length > 0) {
                                    addCondicao(pergunta.id, perguntaOrigemId, perguntaOrigem.opcoes_respostas[0].id);
                                  }
                                }}
                              />
                              <p className="text-xs text-gray-500">
                                Selecione uma pergunta que determine quando esta pergunta deve ser exibida
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowCondicoesModal(null)}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder; 