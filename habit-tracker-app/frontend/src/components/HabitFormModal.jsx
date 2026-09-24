import { useState } from "react";
import { validateHabit } from "../lib/habits";

export default function HabitFormModal({ habit, onSubmit, onClose }) {
  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [error, setError] = useState(null);
  function handleSubmit(event) {
  event.preventDefault();
  const result = validateHabit({ name, description });
  if (!result.valid) {
    setError(result.error);
    return;
  }
  setError(null);
  onSubmit(result.values);
}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>{habit ? "Editar hábito" : "Nuevo hábito"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </label>
          <label>
            Descripción (opcional)
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
