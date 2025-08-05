import FormBuilder from '../../../../components/form-builder/FormBuilder';

interface EditarFormularioProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarFormulario({ params }: EditarFormularioProps) {
  const { id } = await params;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FormBuilder formularioId={id} isEditing={true} />
    </div>
  );
} 