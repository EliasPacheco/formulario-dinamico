'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { formularioService, respostaFormularioService, formularioCompletoService } from '../../../../lib/services';
import { Formulario, RespostaFormulario, FormularioCompleto } from '../../../../types';
import Button from '../../../../components/ui/Button';
import { useRouter } from 'next/navigation';

interface RespostasPageProps {
  params: {
    id: string;
  };
}

const RespostasPage: React.FC<RespostasPageProps> = ({ params }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [formularioCompleto, setFormularioCompleto] = useState<FormularioCompleto | null>(null);
  const [respostas, setRespostas] = useState<RespostaFormulario[]>([]);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [formularioData, formularioCompletoData, respostasData] = await Promise.all([
        formularioService.getById(params.id),
        formularioCompletoService.getById(params.id),
        respostaFormularioService.getByFormularioId(params.id)
      ]);

      setFormulario(formularioData);
      setFormularioCompleto(formularioCompletoData);
      setRespostas(respostasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!formularioCompleto || respostas.length === 0) return;

    // Criar cabeçalho do CSV
    const headers = ['Data/Hora', ...formularioCompleto.perguntas.map((p: any) => p.titulo)];
    const csvContent = [
      headers.join(','),
      ...respostas.map(resposta => {
        const row = [
          new Date(resposta.createdAt).toLocaleString('pt-BR'),
          ...formularioCompleto.perguntas.map((pergunta: any) => {
            const respostaPergunta = resposta.respostas.find((r: any) => r.id_pergunta === pergunta.id);
            if (!respostaPergunta) return '';
            
            if (Array.isArray(respostaPergunta.resposta)) {
              return respostaPergunta.resposta.join('; ');
            }
            return String(respostaPergunta.resposta || '');
          })
        ];
        return row.join(',');
      })
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${formulario?.titulo || 'formulario'}_respostas.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatResposta = (resposta: any, tipoPergunta: string): string => {
    if (resposta === null || resposta === undefined) return '-';
    
    if (Array.isArray(resposta)) {
      return resposta.join(', ');
    }
    
    return String(resposta);
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
        <Button
          onClick={() => router.push('/formularios')}
          className="mt-4"
        >
          Voltar para Formulários
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/formularios')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{formulario.titulo}</h1>
          <p className="text-gray-600">Respostas do formulário</p>
        </div>
        {respostas.length > 0 && (
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {respostas.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma resposta encontrada</h3>
          <p className="text-gray-500">
            Este formulário ainda não recebeu nenhuma resposta.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                                     {formularioCompleto?.perguntas.map((pergunta: any) => (
                     <th key={pergunta.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       {pergunta.titulo}
                     </th>
                   ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {respostas.map((resposta, index) => (
                  <tr key={resposta.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(resposta.createdAt).toLocaleString('pt-BR')}
                    </td>
                                         {formularioCompleto?.perguntas.map((pergunta: any) => {
                       const respostaPergunta = resposta.respostas.find((r: any) => r.id_pergunta === pergunta.id);
                      return (
                        <td key={pergunta.id} className="px-6 py-4 text-sm text-gray-900">
                          {formatResposta(respostaPergunta?.resposta, respostaPergunta?.tipo_pergunta || '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-500">
        Total de respostas: {respostas.length}
      </div>
    </div>
  );
};

export default RespostasPage; 