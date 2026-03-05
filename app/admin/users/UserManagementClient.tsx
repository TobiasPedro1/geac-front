"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, User, Mail, Calendar, Edit2, Trash2, X } from "lucide-react";
import { UserResponseDTO, UserPatchRequestDTO } from "@/types/user";
import { updateUserAction, deleteUserAction } from "@/app/actions/userAdminActions";

interface Props {
  initialUsers: UserResponseDTO[];
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  PROFESSOR: "Professor",
  STUDENT: "Estudante",
  ORGANIZER: "Organizador",
};

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
  PROFESSOR: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  ORGANIZER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  STUDENT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
};

export default function UserManagementClient({ initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<UserResponseDTO[]>(initialUsers);
  const [search, setSearch] = useState("");

  // Estados de Edição
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
  const [formData, setFormData] = useState<UserPatchRequestDTO>({ name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal de Exclusão
  const [userToDelete, setUserToDelete] = useState<UserResponseDTO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtro
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) || 
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleEditClick = (user: UserResponseDTO) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "" });
    setError("");
    setSuccess("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: UserPatchRequestDTO) => ({ ...prev, [name]: value }));
  };

  // Submissão do Formulário (Apenas Update/Patch)
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Cria payload dinâmico apenas com o que mudou (Aproveitando o PATCH)
      const payload: UserPatchRequestDTO = {};
      if (formData.name !== editingUser.name) payload.name = formData.name;
      if (formData.email !== editingUser.email) payload.email = formData.email;
      if (formData.role !== editingUser.role) payload.role = formData.role;

      if (Object.keys(payload).length === 0) {
        throw new Error("Nenhuma alteração detectada.");
      }

      const result = await updateUserAction(editingUser.id, payload);
      if (result.error) throw new Error(result.error);
      
      setSuccess("Usuário atualizado com sucesso!");
      
      // Atualização otimista
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...payload } as UserResponseDTO : u));
      setTimeout(() => setEditingUser(null), 2000); // Fecha form após sucesso
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const result = await deleteUserAction(userToDelete.id);
      if (result.error) throw new Error(result.error);
      
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
      router.refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ── Painel de Edição (Só aparece quando clicar em Editar) ── */}
      {editingUser && (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border border-blue-200 dark:border-blue-900/50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-500" /> Editar Usuário
            </h2>
            <button onClick={handleCancelEdit} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            {error && <div className="text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm">{error}</div>}
            {success && <div className="text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nome</label>
                <input
                  name="name" type="text" required value={formData.name} onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email</label>
                <input
                  name="email" type="email" required value={formData.email} onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Nível de Acesso (Role)</label>
                <select
                  name="role" required value={formData.role} onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg dark:bg-zinc-900 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="STUDENT">Estudante</option>
                  <option value="ORGANIZER">Organizador</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Busca e Tabela ── */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuário</th>
                <th className="px-6 py-4 font-semibold">Acesso</th>
                <th className="px-6 py-4 font-semibold">Data de Cadastro</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-white">{user.name}</div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_STYLES[user.role] || "bg-zinc-100 text-zinc-800"}`}>
                        <Shield className="w-3 h-3" />
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Editar Usuário">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setUserToDelete(user)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Excluir Usuário">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Deleção ── */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Tem certeza que deseja excluir permanentemente o usuário <strong>{userToDelete.name}</strong>? Esta ação removerá o acesso dele à plataforma.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setUserToDelete(null)} disabled={deleteLoading} className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium disabled:opacity-50">
                {deleteLoading ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}