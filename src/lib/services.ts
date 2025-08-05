import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Formulario, Pergunta, OpcaoResposta, OpcaoRespostaPergunta, FormularioCompleto, RespostaFormulario, RespostaPergunta, CondicaoPergunta } from '../types';

// Formulários
export const formularioService = {
  async create(formulario: Omit<Formulario, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'formularios'), {
      ...formulario,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, formulario: Partial<Formulario>): Promise<void> {
    const docRef = doc(db, 'formularios', id);
    await updateDoc(docRef, {
      ...formulario,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'formularios', id);
    await deleteDoc(docRef);
  },

  async getAll(): Promise<Formulario[]> {
    const q = query(collection(db, 'formularios'));
    const querySnapshot = await getDocs(q);
    const formularios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Formulario[];
    
    // Ordenar no cliente em vez de usar orderBy no servidor
    return formularios.sort((a, b) => a.ordem - b.ordem);
  },

  async getById(id: string): Promise<Formulario | null> {
    const docRef = doc(db, 'formularios', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
      } as Formulario;
    }
    return null;
  },
};

// Perguntas
export const perguntaService = {
  async create(pergunta: Omit<Pergunta, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'perguntas'), {
      ...pergunta,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, pergunta: Partial<Pergunta>): Promise<void> {
    const docRef = doc(db, 'perguntas', id);
    await updateDoc(docRef, {
      ...pergunta,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'perguntas', id);
    await deleteDoc(docRef);
  },

  async getByFormularioId(formularioId: string): Promise<Pergunta[]> {
    const q = query(
      collection(db, 'perguntas'), 
      where('id_formulario', '==', formularioId)
    );
    const querySnapshot = await getDocs(q);
    const perguntas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Pergunta[];
    
    // Ordenar no cliente em vez de usar orderBy no servidor
    return perguntas.sort((a, b) => a.ordem - b.ordem);
  },
};

// Opções de Resposta
export const opcaoRespostaService = {
  async create(opcao: Omit<OpcaoResposta, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'opcoes_respostas'), {
      ...opcao,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, opcao: Partial<OpcaoResposta>): Promise<void> {
    const docRef = doc(db, 'opcoes_respostas', id);
    await updateDoc(docRef, {
      ...opcao,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'opcoes_respostas', id);
    await deleteDoc(docRef);
  },

  async getByPerguntaId(perguntaId: string): Promise<OpcaoResposta[]> {
    const q = query(
      collection(db, 'opcoes_respostas'), 
      where('id_pergunta', '==', perguntaId)
    );
    const querySnapshot = await getDocs(q);
    const opcoes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OpcaoResposta[];
    
    // Ordenar no cliente em vez de usar orderBy no servidor
    return opcoes.sort((a, b) => a.ordem - b.ordem);
  },
};

// Condições (Opções de Resposta - Pergunta)
export const condicaoService = {
  async create(condicao: Omit<OpcaoRespostaPergunta, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'opcoes_resposta_pergunta'), {
      ...condicao,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'opcoes_resposta_pergunta', id);
    await deleteDoc(docRef);
  },

  async getByOpcaoRespostaId(opcaoRespostaId: string): Promise<OpcaoRespostaPergunta[]> {
    const q = query(
      collection(db, 'opcoes_resposta_pergunta'), 
      where('id_opcao_resposta', '==', opcaoRespostaId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OpcaoRespostaPergunta[];
  },

  async getByPerguntaId(perguntaId: string): Promise<OpcaoRespostaPergunta[]> {
    const q = query(
      collection(db, 'opcoes_resposta_pergunta'), 
      where('id_pergunta', '==', perguntaId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OpcaoRespostaPergunta[];
  },
};

// Serviço completo para buscar formulário com todas as relações
export const formularioCompletoService = {
  async getById(id: string): Promise<FormularioCompleto | null> {
    const formulario = await formularioService.getById(id);
    if (!formulario) return null;

    const perguntas = await perguntaService.getByFormularioId(id);
    
    const perguntasCompletas = await Promise.all(
      perguntas.map(async (pergunta) => {
        const opcoes_respostas = await opcaoRespostaService.getByPerguntaId(pergunta.id);
        const condicoes = await condicaoService.getByPerguntaId(pergunta.id);
        
        return {
          ...pergunta,
          opcoes_respostas,
          condicoes,
        };
      })
    );

    return {
      ...formulario,
      perguntas: perguntasCompletas,
    };
  },
};

// Serviço para respostas de formulários
export const respostaFormularioService = {
  async create(resposta: Omit<RespostaFormulario, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'respostas_formularios'), {
      ...resposta,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getByFormularioId(formularioId: string): Promise<RespostaFormulario[]> {
    const q = query(
      collection(db, 'respostas_formularios'), 
      where('id_formulario', '==', formularioId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as RespostaFormulario[];
  },
};

// Serviço para condições de perguntas
export const condicaoPerguntaService = {
  async create(condicao: Omit<CondicaoPergunta, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'condicoes_perguntas'), {
      ...condicao,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'condicoes_perguntas', id);
    await deleteDoc(docRef);
  },

  async getByPerguntaDestino(perguntaDestinoId: string): Promise<CondicaoPergunta[]> {
    const q = query(
      collection(db, 'condicoes_perguntas'), 
      where('id_pergunta_destino', '==', perguntaDestinoId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CondicaoPergunta[];
  },

  async getByPerguntaOrigem(perguntaOrigemId: string): Promise<CondicaoPergunta[]> {
    const q = query(
      collection(db, 'condicoes_perguntas'), 
      where('id_pergunta_origem', '==', perguntaOrigemId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CondicaoPergunta[];
  },
}; 