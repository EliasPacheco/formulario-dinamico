export interface Formulario {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pergunta {
  id: string;
  id_formulario: string;
  titulo: string;
  codigo: string;
  orientacao_resposta: 'horizontal' | 'vertical';
  ordem: number;
  obrigatoria: boolean;
  sub_pergunta: boolean;
  tipo_pergunta: 'Sim_Não' | 'multimpla_escola' | 'unica_escolha' | 'texto_livre' | 'Inteiro' | 'Numero com duas casa decimais';
  createdAt: Date;
  updatedAt: Date;
}

export interface OpcaoResposta {
  id: string;
  id_pergunta: string;
  resposta: string;
  ordem: number;
  resposta_aberta: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpcaoRespostaPergunta {
  id: string;
  id_opcao_resposta: string;
  id_pergunta: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormularioCompleto extends Formulario {
  perguntas: (Pergunta & {
    opcoes_respostas: OpcaoResposta[];
    condicoes: OpcaoRespostaPergunta[];
  })[];
}

// Novas interfaces para respostas
export interface RespostaFormulario {
  id: string;
  id_formulario: string;
  respostas: RespostaPergunta[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RespostaPergunta {
  id_pergunta: string;
  resposta: any; // string, number, array, etc.
  tipo_pergunta: string;
}

export interface CondicaoPergunta {
  id: string;
  id_pergunta_origem: string; // Pergunta que determina a condição
  id_opcao_resposta: string; // Opção que ativa a condição
  id_pergunta_destino: string; // Pergunta que será exibida/ocultada
  createdAt: Date;
  updatedAt: Date;
}

export type TipoPergunta = Pergunta['tipo_pergunta'];
export type OrientacaoResposta = Pergunta['orientacao_resposta']; 