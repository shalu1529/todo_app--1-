import React, { useState, useEffect } from 'react';

const TaskForm = ({ onSave, selectedTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'Low',
  });

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title,
        description: selectedTask.description,
        due_date: selectedTask.due_date,
        priority: selectedTask.priority,
      });
    }
  }, [selectedTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', description: '', due_date: '', priority: 'Low' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block mb-1 text-gray-700 font-medium">Title</label>
        <input
          type="text"
          name="title"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700 font-medium">Description</label>
        <textarea
          name="description"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add details about the task"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Due Date</label>
          <input
            type="date"
            name="due_date"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">Priority</label>
          <select
            name="priority"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low 🟢</option>
            <option value="Medium">Medium 🟡</option>
            <option value="High">High 🔴</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text py-2 rounded-lg font-medium  transition"
      >
        {selectedTask ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
};

export default TaskForm;



