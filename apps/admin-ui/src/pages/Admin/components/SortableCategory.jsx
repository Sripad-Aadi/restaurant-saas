import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';

const SortableCategory = ({ category, isActive, onClick, onEdit, onDelete, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center group cursor-pointer p-3 rounded-lg transition-colors border ${
        isActive 
          ? 'bg-primary/10 border-primary/20' 
          : 'hover:bg-light-bg border-transparent'
      }`}
    >
      <div {...attributes} {...listeners} className="mr-3 cursor-grab text-text-muted hover:text-text-primary">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0" onClick={onClick}>
        <h4 className={`font-medium truncate ${isActive ? 'text-primary' : 'text-text-primary'}`}>
          {category.name}
        </h4>
        <p className="text-xs text-text-secondary">
          {category.isActive ? 'Active' : 'Inactive'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-1 text-text-muted hover:text-primary rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(category._id); }}
            className="p-1 text-text-muted hover:text-error rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableCategory;
