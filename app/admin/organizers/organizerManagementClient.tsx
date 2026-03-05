"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { OrganizerResponseDTO, OrganizerRequestDTO } from "@/types/organizer";
import { createOrganizerAction, updateOrganizerAction, deleteOrganizerAction } from "@/app/actions/adminActions";

interface Props {
  initialOrganizers: OrganizerResponseDTO[];
}

export default function OrganizerManagementClient({ initialOrganizers }: Props) {
  const router = useRouter();
  const [organizers, setOrganizers] = useState(initialOrganizers);
  
  // Estado para Ordenação Alfabética ('default', 'asc', 'desc')
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  // Estados para o formulário (Serve para Criar e Editar)
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrganizerRequestDTO>({ name: "", contactEmail: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal de deleção
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState<OrganizerResponseDTO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (org: OrganizerResponseDTO) => {
    setIsEditing(org.id);
    setFormData({ name: org.name, contactEmail: org.contactEmail });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({ name: "", contactEmail: "" });
    setError("");
    setSuccess("");
  };

  const confirmDelete = (org: OrganizerResponseDTO) => {
    setOrganizerToDelete(org);
    setDeleteModalOpen(true);
  };

  // Submissão do Formulário (Criar ou Atualizar)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isEditing) {
        const result = await updateOrganizerAction(isEditing, formData);
        if (result.error) throw new Error(result.error);
        setSuccess("Organização atualizada com sucesso!");
        
        // Atualiza estado local imediatamente (Edição)
        setOrganizers(prev => prev.map(o => o.id === isEditing ? { ...o, ...formData } : o));
        setIsEditing(null);
      } else {
        const result = await createOrganizerAction(formData);
        if (result.error) throw new Error(result.error);
        
        setSuccess("Organização cadastrada com sucesso!");
        
        // Atualiza estado local imediatamente (Criação)
        if (result.data) {
          setOrganizers(prev => [...prev, result.data]);
        }
      }
      
      setFormData({ name: "", contactEmail: "" });
      router.refresh(); 
    } catch (err) {
      setError((err as Error).message || "Ocorreu um erro na operação.");
    } finally {
      setLoading(false);
      // Remove a mensagem de sucesso após 3 segundos para limpar a UI
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // Executar Deleção
  const handleDelete = async () => {
    if (!organizerToDelete) return;
    setDeleteLoading(true);
    try {
      const result = await deleteOrganizerAction(organizerToDelete.id);
      if (result.error) throw new Error(result.error);
      
      // Remove da lista imediatamente
      setOrganizers(prev => prev.filter(o => o.id !== organizerToDelete.id));
      setDeleteModalOpen(false);
      setSuccess("Organização removida com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleteLoading(false);
      setOrganizerToDelete(null);
    }
  };

  // Lógica de Ordenação usando useMemo para otimizar a renderização
  const displayedOrganizers = useMemo(() => {
    const list = [...organizers];
    if (sortOrder === 'asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortOrder === 'desc') {
      return list.sort((a, b) => b.name.localeCompare(a.name));
    }
    return list; // 'default' retorna a ordem como chegou do backend/inserção
  }, [organizers, sortOrder]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Formulário (Criar / Editar) */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 transition-all">
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">
          {isEditing ? "Editar Organização" : "Nova Organização"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Nome da Organização
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ex: Departamento de Computação"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium mb-1 dark:text-gray-200">
                Email de Contato
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                placeholder="Ex: contato@org.edu.br"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors font-medium"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded font-medium transition-colors disabled:opacity-50
                ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Listagem e Controles */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        
        {/* Barra de Ferramentas / Filtros da Tabela */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
            Organizações Cadastradas ({organizers.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Ordenar por:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-sm border-zinc-300 dark:border-zinc-600 rounded-md py-1.5 pl-3 pr-8 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="default">Data de Criação</option>
              <option value="asc">Ordem Alfabética (A-Z)</option>
              <option value="desc">Ordem Alfabética (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Email de Contato</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {displayedOrganizers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-zinc-500">
                    Nenhuma organização encontrada.
                  </td>
                </tr>
              ) : (
                displayedOrganizers.map((org) => (
                  <tr key={org.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{org.name}</td>
                    <td className="px-6 py-4">{org.contactEmail}</td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      <button
                        onClick={() => handleEditClick(org)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => confirmDelete(org)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Deleção */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Tem certeza que deseja excluir a organização <strong>{organizerToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded transition-colors font-medium disabled:opacity-50"
              >
                {deleteLoading ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}