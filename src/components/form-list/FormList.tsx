'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import { formularioService, respostaFormularioService } from '../../lib/services';
import { Formulario, RespostaFormulario } from '../../types';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

const FormList: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [respostasCount, setRespostasCount] = useState<{ [formularioId: string]: number }>({});

  useEffect(() => {
    loadFormularios();
  }, []);

  const loadFormularios = async () => {
    try {
      setLoading(true);
      const data = await formularioService.getAll();
      setFormularios(data);

      // Carregar contagem de respostas para cada formulário
      const countData: { [formularioId: string]: number } = {};
      for (const formulario of data) {
        const respostas = await respostaFormularioService.getByFormularioId(formulario.id);
        countData[formulario.id] = respostas.length;
      }
      setRespostasCount(countData);
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este formulário?')) {
      try {
        await formularioService.delete(id);
        await loadFormularios();
      } catch (error) {
        console.error('Erro ao excluir formulário:', error);
        alert('Erro ao excluir formulário');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Formulários</h1>
        <Button
          onClick={() => router.push('/formularios/novo')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Formulário
        </Button>
      </div>

      {formularios.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum formulário encontrado</h3>
          <p className="text-gray-500 mb-4">
            Crie seu primeiro formulário para começar a coletar respostas.
          </p>
          <Button
            onClick={() => router.push('/formularios/novo')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Formulário
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formularios.map((formulario) => (
            <div
              key={formulario.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{formulario.titulo}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/formularios/${formulario.id}/visualizar`)}
                    title="Visualizar formulário"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/formularios/${formulario.id}/editar`)}
                    title="Editar formulário"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(formulario.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Excluir formulário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {formulario.descricao && (
                <p className="text-gray-600 text-sm mb-4">{formulario.descricao}</p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {respostasCount[formulario.id] || 0} resposta{respostasCount[formulario.id] !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/formularios/${formulario.id}/respostas`)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  title="Ver respostas"
                >
                  <BarChart3 className="h-3 w-3" />
                  Ver Respostas
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormList; 