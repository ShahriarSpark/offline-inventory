import React, { useState, useEffect } from "react";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  items: string[];
  description: string;
  createdDate: string;
}

const AddItem: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/data/categories.json")
      .then((res) => {
        // Migrate old structure to new if needed
        const data = res.data.map((cat: any) => ({
          ...cat,
          items: cat.items || [],
        }));
        setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      setMessage("Please select a category.");
      return;
    }
    if (!newItemName.trim()) {
      setMessage("Item name is required.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const updatedCategories = categories.map((cat) =>
        cat.id === selectedCategoryId
          ? { ...cat, items: [...(cat.items || []), newItemName] }
          : cat
      );
      // Save to backend (uses correct server URL)
      await axios.post(
        "https://offline-inventory-api-with-fs.onrender.com/api/categories",
        updatedCategories
      );
      setCategories(updatedCategories);
      setMessage("Item added successfully!");
      setNewItemName("");
    } catch (err) {
      setMessage("Failed to add item.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded shadow-md max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Add Category Item</h2>
      <form onSubmit={handleAddItem} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1">Select Category</label>
          <select
            className="w-full border px-2 py-1 rounded"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">-- Choose Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">New Item Name</label>
          <input
            type="text"
            className="w-full border px-2 py-1 rounded"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        {message && <div className="mt-2 text-sm text-red-500">{message}</div>}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border rounded-lg p-4 bg-white/20 shadow"
          >
            <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
            <ul className="list-disc pl-6 mb-2">
              {cat.items && cat.items.length > 0 ? (
                cat.items.map((item, idx) => <li key={idx}>{item}</li>)
              ) : (
                <li className="text-slate-400">No items yet</li>
              )}
            </ul>
            <p className="text-sm text-slate-500">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddItem;
