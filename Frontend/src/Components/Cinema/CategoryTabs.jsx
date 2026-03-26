import React from 'react'
import { Check, Pencil, X, Plus } from 'lucide-react'

const CategoryTabs = ({
    categories,
    activeCategory,
    setActiveCategory,
    isEditingCategories,
    setIsEditingCategories,
    newCategory,
    setNewCategory,
    handleAddCategory,
    handleDeleteCategory
}) => {
    return (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-8 pt-4 mask-linear-fade relative">

            {/* Edit Tabs Toggle */}
            <button
                onClick={() => setIsEditingCategories(!isEditingCategories)}
                className={`
          shrink-0 p-2.5 rounded-full border transition-all duration-300
          ${isEditingCategories
                        ? 'bg-red-500/20 border-red-500 text-red-400 rotate-12'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    }
        `}
                title={isEditingCategories ? "Done Editing" : "Manage Tabs"}
            >
                {isEditingCategories ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>

            {/* Categories List */}
            {categories.map(cat => (
                <div key={cat} className="relative group/tag">
                    <button
                        onClick={() => !isEditingCategories && setActiveCategory(cat)}
                        disabled={isEditingCategories}
                        className={`
                shrink-0 px-5 py-2 rounded-full text-xs font-bold border transition-all duration-300 whitespace-nowrap
                ${activeCategory === cat && !isEditingCategories
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                            }
              ${isEditingCategories && !["All", "For You"].includes(cat) ? 'animate-shake cursor-default opacity-80' : ''}
              ${isEditingCategories && ["All", "For You"].includes(cat) ? 'opacity-40 cursor-not-allowed' : ''}
              `}
                    >
                        {cat}
                    </button>

                    {/* Delete Button (Only in Edit Mode & Not Default Tags) */}
                    {isEditingCategories && !["All", "For You"].includes(cat) && (
                        <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg z-50 hover:scale-110 transition-transform border border-white/10"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ))}

            {/* Add New Tag Button (Only in Edit Mode) */}
            {isEditingCategories && (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New Tag..."
                        className="w-24 px-3 py-2 rounded-full bg-white/5 border border-white/20 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                        className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default CategoryTabs
