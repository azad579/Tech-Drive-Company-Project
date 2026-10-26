import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PersonalNote, TodoTask } from '../types';

interface PersonalViewProps {
  initialTab?: 'note' | 'todo';
}

export const PersonalView: React.FC<PersonalViewProps> = ({ initialTab = 'note' }) => {
  const {
    currentRoute,
    setCurrentRoute,
    personalNotes,
    addPersonalNote,
    updatePersonalNote,
    deletePersonalNote,
    toggleFavoriteNote,
    todos,
    addTodoTask,
    toggleTodoTask,
    deleteTodoTask
  } = useApp();

  const isTodo = currentRoute === 'axe_todo.php' || initialTab === 'todo';

  // Personal Note State
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [noteSearch, setNoteSearch] = useState<string>('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tag: 'Work' as PersonalNote['tag'],
    isPinned: false,
    isFavorite: false
  });

  // Todo State
  const [todoFilter, setTodoFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [isTodoModalOpen, setIsTodoModalOpen] = useState<boolean>(false);
  const [todoForm, setTodoForm] = useState({
    title: '',
    priority: 'Medium' as TodoTask['priority'],
    dueDate: new Date().toISOString().split('T')[0],
    category: 'General'
  });

  // Filter notes
  const filteredNotes = personalNotes.filter(n => {
    if (showFavoritesOnly && !n.isFavorite) return false;
    if (selectedTag !== 'ALL' && n.tag !== selectedTag) return false;
    if (noteSearch) {
      const q = noteSearch.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  // Sort notes (pinned first)
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  // Filter todos
  const filteredTodos = todos.filter(t => {
    if (todoFilter === 'PENDING') return !t.completed;
    if (todoFilter === 'COMPLETED') return t.completed;
    return true;
  });

  const handleOpenNoteModal = (note?: PersonalNote) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        title: note.title,
        content: note.content,
        tag: note.tag,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        title: '',
        content: '',
        tag: 'Work',
        isPinned: false,
        isFavorite: false
      });
    }
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    if (editingNote) {
      updatePersonalNote(editingNote.id, noteForm);
    } else {
      addPersonalNote(noteForm);
    }
    setIsNoteModalOpen(false);
  };

  const handleSaveTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoForm.title.trim()) return;

    addTodoTask({
      title: todoForm.title.trim(),
      priority: todoForm.priority,
      dueDate: todoForm.dueDate,
      category: todoForm.category,
      completed: false
    });
    setTodoForm({
      title: '',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'General'
    });
    setIsTodoModalOpen(false);
  };

  const tagColors: Record<PersonalNote['tag'], { bg: string; text: string }> = {
    Personal: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-600' },
    Work: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-600' },
    Social: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-600' },
    Important: { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-600' }
  };

  return (
    <div className="space-y-4">
      {/* Top Header / Breadcrumb matching ERP style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>{isTodo ? 'Todo List' : 'Personal Note'}</span>
            <span className="text-xs font-normal text-gray-500">/ Personal</span>
          </h1>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-sm shadow-xs border border-gray-300 overflow-hidden text-xs">
          <button
            onClick={() => setCurrentRoute('axe_note.php', 'Personal Note')}
            className={`px-3 py-1.5 font-semibold flex items-center space-x-1.5 transition ${
              !isTodo ? 'bg-[#0084bf] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className="fa fa-sticky-note-o"></i>
            <span>Personal Note</span>
          </button>
          <button
            onClick={() => setCurrentRoute('axe_todo.php', 'Todo List')}
            className={`px-3 py-1.5 font-semibold flex items-center space-x-1.5 transition ${
              isTodo ? 'bg-[#0084bf] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className="fa fa-check-square-o"></i>
            <span>Todo List</span>
          </button>
        </div>
      </div>

      {/* --- PERSONAL NOTE VIEW (axe_note.php) matching screenshot image_e276fed5.png --- */}
      {!isTodo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Left Column: Actions & Tags */}
          <div className="space-y-4">
            <button
              onClick={() => handleOpenNoteModal()}
              className="w-full bg-[#0084bf] hover:bg-[#0073a8] text-white py-2 px-3 rounded-sm text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <i className="fa fa-plus"></i>
              <span>Add</span>
            </button>

            <div className="bg-white rounded-sm border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-1">
                <button
                  onClick={() => {
                    setSelectedTag('ALL');
                    setShowFavoritesOnly(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition ${
                    selectedTag === 'ALL' && !showFavoritesOnly
                      ? 'bg-[#00305d] text-white font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <i className="fa fa-book"></i>
                    <span>All Notes</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      selectedTag === 'ALL' && !showFavoritesOnly
                        ? 'bg-sky-400 text-[#00305d]'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {personalNotes.length}
                  </span>
                </button>

                <button
                  onClick={() => setShowFavoritesOnly(true)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition ${
                    showFavoritesOnly ? 'bg-[#00305d] text-white font-bold' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <i className="fa fa-star text-amber-400"></i>
                    <span>Favourites</span>
                  </span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                    {personalNotes.filter(n => n.isFavorite).length}
                  </span>
                </button>
              </div>

              {/* Tags Section */}
              <div className="border-t border-gray-100 p-2 space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Tags
                </div>
                {(['Personal', 'Work', 'Social', 'Important'] as const).map(tag => {
                  const count = personalNotes.filter(n => n.tag === tag).length;
                  const isSelected = selectedTag === tag && !showFavoritesOnly;

                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setShowFavoritesOnly(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-left transition ${
                        isSelected ? 'bg-sky-50 text-[#0084bf] font-bold' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            tag === 'Personal'
                              ? 'bg-blue-500'
                              : tag === 'Work'
                              ? 'bg-amber-500'
                              : tag === 'Social'
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        ></span>
                        <span>{tag}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Note Search & Cards Grid */}
          <div className="md:col-span-3 space-y-3">
            <div className="bg-white p-2.5 rounded-sm border border-gray-200 shadow-xs flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={noteSearch}
                  onChange={e => setNoteSearch(e.target.value)}
                  placeholder="Search note by title or keywords..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:border-[#0084bf] focus:outline-none"
                />
                <i className="fa fa-search absolute left-2.5 top-2.5 text-gray-400 text-xs"></i>
              </div>
              <div className="text-xs text-gray-500">
                Showing <strong className="text-gray-800">{sortedNotes.length}</strong> notes
              </div>
            </div>

            {sortedNotes.length === 0 ? (
              <div className="bg-white rounded-sm border border-gray-200 p-12 text-center text-gray-400 text-xs">
                <i className="fa fa-file-text-o text-4xl mb-2 text-gray-300 block"></i>
                <span>No notes match your selection. Click "+ Add" to create one.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {sortedNotes.map(note => {
                  const tagInfo = tagColors[note.tag];
                  return (
                    <div
                      key={note.id}
                      className={`bg-white rounded-sm border transition shadow-xs p-3.5 flex flex-col justify-between relative hover:border-[#0084bf] ${
                        note.isPinned ? 'border-sky-300 bg-sky-50/20' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        {/* Card Top: Pin, Favorite, Tag, Time */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tagInfo.bg}`}
                          >
                            {note.tag}
                          </span>

                          <div className="flex items-center space-x-2 text-xs">
                            {note.isPinned && (
                              <i
                                className="fa fa-thumb-tack text-sky-600"
                                title="Pinned note"
                              ></i>
                            )}
                            <button
                              onClick={() => toggleFavoriteNote(note.id)}
                              className="focus:outline-none"
                              title="Toggle favorite"
                            >
                              <i
                                className={`fa ${
                                  note.isFavorite ? 'fa-star text-amber-400' : 'fa-star-o text-gray-300 hover:text-amber-400'
                                }`}
                              ></i>
                            </button>
                          </div>
                        </div>

                        {/* Title & Body */}
                        <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1">
                          {note.title}
                        </h3>
                        <p className="text-gray-600 text-[11px] leading-relaxed whitespace-pre-wrap line-clamp-4">
                          {note.content}
                        </p>
                      </div>

                      {/* Card Footer: Date & Actions */}
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="flex items-center space-x-1">
                          <i className="fa fa-calendar-o"></i>
                          <span>
                            {note.date} &bull; {note.time}
                          </span>
                        </span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenNoteModal(note)}
                            className="text-[#0084bf] hover:text-sky-800 font-semibold"
                            title="Edit Note"
                          >
                            <i className="fa fa-pencil"></i> Edit
                          </button>
                          <button
                            onClick={() => deletePersonalNote(note.id)}
                            className="text-red-500 hover:text-red-700 font-semibold"
                            title="Delete Note"
                          >
                            <i className="fa fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TODO LIST VIEW (axe_todo.php) matching screenshot image_9b6846c3.png --- */}
      {isTodo && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-xs p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-700">Filter:</span>
              <div className="inline-flex rounded border border-gray-300 overflow-hidden">
                {(['ALL', 'PENDING', 'COMPLETED'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTodoFilter(tab)}
                    className={`px-3 py-1 font-semibold ${
                      todoFilter === tab
                        ? 'bg-[#0084bf] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsTodoModalOpen(true)}
              className="bg-[#0084bf] hover:bg-[#0073a8] text-white px-3 py-1.5 rounded-sm font-bold flex items-center space-x-1.5 shadow-xs transition"
            >
              <i className="fa fa-plus"></i>
              <span>Add New Task</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#00305d] text-white">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Status</th>
                  <th className="py-2.5 px-3">Task Details</th>
                  <th className="py-2.5 px-3 w-32">Category</th>
                  <th className="py-2.5 px-3 w-28 text-center">Priority</th>
                  <th className="py-2.5 px-3 w-32">Due Date</th>
                  <th className="py-2.5 px-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTodos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No tasks found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredTodos.map(todo => (
                    <tr
                      key={todo.id}
                      className={`hover:bg-gray-50 transition ${
                        todo.completed ? 'bg-gray-50/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodoTask(todo.id)}
                          className="w-4 h-4 text-[#0084bf] rounded border-gray-300 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-medium ${
                            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {todo.title}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-gray-200">
                          {todo.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            todo.priority === 'High'
                              ? 'bg-red-100 text-red-700'
                              : todo.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 font-mono text-[11px]">
                        <i className="fa fa-calendar-check-o mr-1 text-gray-400"></i>
                        {todo.dueDate}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => deleteTodoTask(todo.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Task"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Create / Edit Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden text-xs">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <span className="font-bold">
                {editingNote ? 'Edit Personal Note' : 'Add Personal Note'}
              </span>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-white hover:text-gray-300 text-base"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Note Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={e => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter note title..."
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category Tag</label>
                  <select
                    value={noteForm.tag}
                    onChange={e =>
                      setNoteForm(prev => ({ ...prev, tag: e.target.value as PersonalNote['tag'] }))
                    }
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Social">Social</option>
                    <option value="Important">Important</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pt-5">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.isPinned}
                      onChange={e => setNoteForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                      className="rounded border-gray-300 text-[#0084bf]"
                    />
                    <span className="font-medium text-gray-700">Pin to top</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.isFavorite}
                      onChange={e => setNoteForm(prev => ({ ...prev, isFavorite: e.target.checked }))}
                      className="rounded border-gray-300 text-amber-500"
                    />
                    <span className="font-medium text-gray-700">Favorite</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Note Content</label>
                <textarea
                  rows={5}
                  value={noteForm.content}
                  onChange={e => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write note description or details..."
                  className="w-full border border-gray-300 rounded p-2 focus:border-[#0084bf] focus:outline-none text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#0084bf] hover:bg-[#0073a8] text-white font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Todo Create Modal */}
      {isTodoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded shadow-xl border border-gray-200 w-full max-w-md overflow-hidden text-xs">
            <div className="bg-[#00305d] text-white px-4 py-2.5 flex items-center justify-between">
              <span className="font-bold">Add New Task</span>
              <button
                onClick={() => setIsTodoModalOpen(false)}
                className="text-white hover:text-gray-300 text-base"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTodo} className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={todoForm.title}
                  onChange={e => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:border-[#0084bf] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={todoForm.priority}
                    onChange={e =>
                      setTodoForm(prev => ({
                        ...prev,
                        priority: e.target.value as TodoTask['priority']
                      }))
                    }
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={todoForm.category}
                    onChange={e => setTodoForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Sales, Banking"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={todoForm.dueDate}
                  onChange={e => setTodoForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTodoModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#0084bf] hover:bg-[#0073a8] text-white font-bold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
