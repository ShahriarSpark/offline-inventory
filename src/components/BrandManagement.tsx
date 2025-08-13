import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Building2,
  Search,
  Upload,
  Link,
  Camera,
} from "lucide-react";
import { Brand } from "../types";
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
} from "../utils/storage";

interface BrandManagementProps {
  user?: any;
  products?: any[];
  onBrandsChange?: () => Promise<void>;
}

const BrandManagement: React.FC<BrandManagementProps> = ({
  onBrandsChange,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<Brand>({
    id: "",
    name: "",
    description: "",
    logoUrl: "",
    logoFile: "",
    createdDate: "",
  });
  const [notification, setNotification] = useState<string>("");
  const [logoUploadMethod, setLogoUploadMethod] = useState<"file" | "url">(
    "url"
  );
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const brandsData = await getBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error("Failed to load brands:", error);
      showNotification("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleAddBrand = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      logoUrl: "",
      logoFile: "",
      createdDate: new Date().toISOString().split("T")[0],
    });
    setSelectedBrand(null);
    setLogoUploadMethod("url");
    setSelectedLogoFile(null);
    setLogoPreview("");
    setShowAddModal(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setFormData(brand);
    setSelectedBrand(brand);
    setLogoUploadMethod(brand.logoFile ? "file" : "url");
    setSelectedLogoFile(null);
    setLogoPreview(brand.logoUrl || brand.logoFile || "");
    setShowEditModal(true);
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        const success = await deleteBrand(brandId);
        if (success) {
          await loadBrands();
          // Also notify parent to refresh its brand list
          if (onBrandsChange) {
            await onBrandsChange();
          }
          showNotification("Brand deleted successfully");
        } else {
          showNotification("Failed to delete brand");
        }
      } catch (error) {
        console.error("Error deleting brand:", error);
        showNotification("Failed to delete brand");
      }
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, logoUrl: url }));
    setLogoPreview(url);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showNotification("Brand name is required");
      return;
    }

    try {
      let finalFormData = { ...formData };

      // Handle logo upload
      if (logoUploadMethod === "file" && selectedLogoFile) {
        // Upload file to server
        const formDataFile = new FormData();
        formDataFile.append("logo", selectedLogoFile);

        const uploadResponse = await fetch(
          "https://offline-inventory-api-with-fs.onrender.com/api/upload/logo",
          {
            method: "POST",
            body: formDataFile,
          }
        );

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          finalFormData.logoFile = uploadResult.filename;
          finalFormData.logoUrl = "";
        } else {
          showNotification("Failed to upload logo file");
          return;
        }
      } else if (logoUploadMethod === "url" && formData.logoUrl) {
        finalFormData.logoFile = "";
      } else {
        // Clear logo fields if no logo is provided
        finalFormData.logoUrl = "";
        finalFormData.logoFile = "";
      }

      let success = false;
      if (selectedBrand) {
        // Update existing brand
        success = await updateBrand(selectedBrand.id, finalFormData);
      } else {
        // Add new brand
        success = await addBrand(finalFormData);
      }

      if (success) {
        await loadBrands();
        // Also notify parent to refresh its brand list
        if (onBrandsChange) {
          await onBrandsChange();
        }
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedBrand(null);
        setSelectedLogoFile(null);
        setLogoPreview("");
        showNotification(
          selectedBrand
            ? "Brand updated successfully"
            : "Brand added successfully"
        );
      } else {
        showNotification(
          selectedBrand ? "Failed to update brand" : "Failed to add brand"
        );
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      showNotification("Failed to save brand");
    }
  };

  const getBrandLogo = (brand: Brand) => {
    if (brand.logoUrl) {
      return brand.logoUrl;
    }
    if (brand.logoFile) {
      // Use the server URL for uploaded files
      return `https://offline-inventory-api-with-fs.onrender.com/uploads/logos/${brand.logoFile}`;
    }
    return null;
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading brands...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-16 sm:pt-20 pb-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        {notification && (
          <div className="fixed top-16 sm:top-24 right-2 sm:right-4 bg-green-500/90 backdrop-blur-sm text-white px-3 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg z-50 border border-green-400/30 text-sm sm:text-base max-w-[calc(100vw-1rem)] sm:max-w-none">
            {notification}
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 sm:p-6 mb-8 shadow-lg shadow-cyan-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 flex-shrink-0">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                  Brand Management
                </h1>
                <p className="text-cyan-400 text-sm sm:text-base">
                  Manage product brands and manufacturers
                </p>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Total Brands: {brands.length}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddBrand}
                className="flex items-center space-x-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Add Brand</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 sm:p-6 mb-6 shadow-lg shadow-cyan-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all text-sm sm:text-base"
              />
            </div>
            <div className="text-slate-400 text-xs sm:text-sm text-center sm:text-left whitespace-nowrap">
              Showing {filteredBrands.length} of {brands.length} brands
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredBrands.map((brand) => {
            const logoUrl = getBrandLogo(brand);
            return (
              <div
                key={brand.id}
                className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-300 shadow-lg shadow-cyan-500/10"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <Building2
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-900 ${
                        logoUrl ? "hidden" : ""
                      }`}
                    />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                    <button
                      onClick={() => handleEditBrand(brand)}
                      className="p-1.5 sm:p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all duration-300 hover:scale-105"
                      title="Edit Brand"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all duration-300 hover:scale-105"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <h3
                  className="text-white font-bold text-base sm:text-lg mb-2 truncate"
                  title={brand.name}
                >
                  {brand.name}
                </h3>
                {brand.description && (
                  <p
                    className="text-slate-400 text-xs sm:text-sm mb-3 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                      lineHeight: "1.4",
                    }}
                    title={brand.description}
                  >
                    {brand.description}
                  </p>
                )}
                <div className="text-slate-500 text-xs">
                  Created: {new Date(brand.createdDate).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>

        {filteredBrands.length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-6 sm:p-12 text-center shadow-lg shadow-cyan-500/10">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-white text-lg sm:text-xl font-bold mb-2">
              No Brands Found
            </h3>
            <p className="text-slate-400 text-sm sm:text-lg mb-4 sm:mb-6 px-4">
              {searchTerm
                ? `No brands match "${searchTerm}"`
                : "No brands have been added yet"}
            </p>
            <button
              onClick={handleAddBrand}
              className="flex items-center space-x-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 mx-auto text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Add Your First Brand</span>
              <span className="xs:hidden">Add Brand</span>
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/20 p-4 sm:p-6 sticky top-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0 pr-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                        {selectedBrand ? "Edit Brand" : "Add New Brand"}
                      </h2>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        {selectedBrand
                          ? "Update brand information"
                          : "Add a new brand to the system"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedBrand(null);
                      setSelectedLogoFile(null);
                      setLogoPreview("");
                    }}
                    className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Brand Name */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter brand name"
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all text-sm sm:text-base"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter brand description"
                      rows={3}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all resize-none text-sm sm:text-base"
                    />
                  </div>

                  {/* Logo Section */}
                  <div>
                    <label className="block text-slate-400 text-sm mb-3">
                      Brand Logo (Optional)
                    </label>

                    {/* Logo Upload Method Toggle */}
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setLogoUploadMethod("url")}
                        className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border transition-all text-sm ${
                          logoUploadMethod === "url"
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                            : "bg-white/10 border-white/20 text-slate-400 hover:bg-white/20"
                        }`}
                      >
                        <Link className="w-4 h-4" />
                        <span>URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoUploadMethod("file")}
                        className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg border transition-all text-sm ${
                          logoUploadMethod === "file"
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                            : "bg-white/10 border-white/20 text-slate-400 hover:bg-white/20"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                      </button>
                    </div>

                    {/* Logo URL Input */}
                    {logoUploadMethod === "url" && (
                      <div>
                        <input
                          type="url"
                          value={formData.logoUrl || ""}
                          onChange={(e) => handleLogoUrlChange(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all text-sm sm:text-base"
                        />
                      </div>
                    )}

                    {/* Logo File Upload */}
                    {logoUploadMethod === "file" && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="truncate">
                            {selectedLogoFile
                              ? selectedLogoFile.name
                              : "Choose Logo File"}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Logo Preview */}
                    {logoPreview && (
                      <div className="mt-4">
                        <label className="block text-slate-400 text-sm mb-2">
                          Logo Preview
                        </label>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center overflow-hidden">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 hidden" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-700/30 p-4 sm:p-6 sticky bottom-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedBrand(null);
                      setSelectedLogoFile(null);
                      setLogoPreview("");
                    }}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl transition-all duration-300 text-center text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 text-center text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    {selectedBrand ? "Update Brand" : "Add Brand"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandManagement;
