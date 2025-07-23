// src/components/TaskList.js
import React, { useState } from "react";

const TaskList = ({ tasks, onDelete, onUpdate }) => {
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleEdit = (task) => {
    setEditId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleSave = () => {
    onUpdate(editId, {
      title: editTitle,
      description: editDescription,
    });
    setEditId(null);
  };

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 shadow-sm"
        >
          {editId === task.id ? (
            <div className="space-y-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="text-gray-600 px-4 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-purple-800">{task.title}</h3>
              <p className="text-gray-700">{task.description}</p>
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
