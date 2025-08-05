import FormViewer from '../../../../components/form-viewer/FormViewer';

interface VisualizarFormularioProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VisualizarFormulario({ params }: VisualizarFormularioProps) {
  const { id } = await params;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FormViewer formularioId={id} />
    </div>
  );
} 