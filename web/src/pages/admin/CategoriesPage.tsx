import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, apiErrorMessage } from "../../api/client";
import type { Category } from "../../api/types";
import { PageHeader } from "../../components/PageHeader";
import { Modal } from "../../components/Modal";

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");

  const q = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await api.get<{ categories: Category[] }>("/categories")).data.categories,
  });

  const createM = useMutation({
    mutationFn: async () =>
      (await api.post("/categories", { name })).data,
    onSuccess: () => {
      toast.success("Category created");
      setCreating(false);
      setName("");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const updateM = useMutation({
    mutationFn: async (id: string) =>
      (await api.put(`/categories/${id}`, { name })).data,
    onSuccess: () => {
      toast.success("Category updated");
      setEditing(null);
      setName("");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/categories/${id}`)).data,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  function openCreate() {
    setCreating(true);
    setName("");
  }
  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
  }
  function submitCreate(e: FormEvent) {
    e.preventDefault();
    createM.mutate();
  }
  function submitEdit(e: FormEvent) {
    e.preventDefault();
    if (editing) updateM.mutate(editing.id);
  }

  const cats = q.data ?? [];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader
        title="Categories"
        subtitle="Organize events by type"
        actions={
          <button className="btn-primary" onClick={openCreate}>
            + New category
          </button>
        }
      />

      <div className="card divide-y divide-slate-100">
        {q.isLoading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : cats.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No categories yet.
          </div>
        ) : (
          cats.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div>
                <div className="font-medium text-slate-800">{c.name}</div>
                <div className="text-xs text-slate-400 font-mono">{c.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary" onClick={() => openEdit(c)}>
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (confirm("Delete this category?")) deleteM.mutate(c.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New category"
      >
        <form onSubmit={submitCreate} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              autoFocus
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={createM.isPending}>
              Create
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit category"
      >
        <form onSubmit={submitEdit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              autoFocus
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={updateM.isPending}>
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
