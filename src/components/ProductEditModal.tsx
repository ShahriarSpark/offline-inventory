import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Package,
  Tag,
  DollarSign,
  Hash,
  FileText,
  Fingerprint,
  Copy,
  Search,
  Building2,
} from "lucide-react";
import { Product } from "../types";
import { getCategories, getBrands } from "../utils/storage";
import {
  generateUniqueId,
  validateCommonId,
  validateUniqueId,
  addUsedUniqueId,
  removeUsedUniqueId,
  formatCommonId,
  formatUniqueId,
} from "../utils/productIdUtils";

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
}) => {
  const [formData, setFormData] = useState<Product>({
    id: "",
    name: "",
    brand: "",
    supplier: "",
    addedDate: "",
    buypricePerUnit: 0,
    sellpricePerUnit: 0,
    stock: 0,
    unit: "",
    category: "",
    rating: 0,
    image: "",
    description: "",
    specifications: {},
    commonId: "",
    uniqueId: "",
  });

  const [specifications, setSpecifications] = useState<{
    [key: string]: string;
  }>({});
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [existingProductNames, setExistingProductNames] = useState<string[]>(
    []
  );
  const [selectedProductName, setSelectedProductName] = useState("");
  const [showProductNameDropdown, setShowProductNameDropdown] = useState(false);

  // Product ID validation states
  const [commonIdValidation, setCommonIdValidation] = useState({
    isValid: true,
    message: "",
  });
  const [uniqueIdValidation, setUniqueIdValidation] = useState({
    isValid: true,
    message: "",
  });

  const [networkItem, setNetworkItem] = useState("");

  const networkItems = ["Router", "Switch", "ONU"];
  // Helper function to auto-populate brand data from database
  const handleBrandSelection = (selectedBrandName: string) => {
    const selectedBrandData = brands.find(
      (brand) => brand.name === selectedBrandName
    );

    setFormData((prev) => ({
      ...prev,
      brand: selectedBrandName,
      // Auto-populate brand data from database
      brandDescription: selectedBrandData?.description || "",
      brandLogo:
        selectedBrandData?.logoUrl || selectedBrandData?.logoFile || "",
    }));
  };

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [categoriesData, brandsData] = await Promise.all([
            getCategories(),
            getBrands(),
          ]);
          setCategories(categoriesData);
          setBrands(brandsData);
        } catch (error) {
          console.error("Failed to load data:", error);
          setCategories([]);
          setBrands([]);
        }
      };
      loadData();
    }
  }, [isOpen]);

  // Load existing product names when category changes
  useEffect(() => {
    if (formData.category) {
      loadExistingProductNames(formData.category);
    } else {
      setExistingProductNames([]);
    }
  }, [formData.category]);

  const loadExistingProductNames = async (category: string) => {
    try {
      // This would typically call an API endpoint to get product names by category
      // For now, we'll use a simple mapping based on the bucket files we found
      const categoryProductNames: { [key: string]: string[] } = {
        // 'Camera': [
        //   'Canon EOS 90D',
        //   'Sony Alpha A7 III',
        //   'Canon EOS R5',
        //   'Canon EOS R6',
        //   'Canon EOS RP',
        //   'Sony Alpha A7R IV',
        //   'Canon EOS 6D Mark II',
        //   'Sony Alpha A9 II',
        //   'Canon EOS 5D Mark IV',
        //   'Sony Alpha A7C'
        // ],
        // 'Router': [
        //   'Asus RT-AC59U',
        //   'Netgear Nighthawk AX8',
        //   'TP-Link Archer AX20',
        //   'D-Link DIR-841',
        //   'Asus RT-AX86U',
        //   'Netgear R6700',
        //   'TP-Link Archer C6',
        //   'D-Link DIR-2150',
        //   'Huawei AX6',
        //   'TP-Link Archer C80'
        // ],
        // 'Storage': [
        //   'Samsung 970 EVO Plus',
        //   'WD Blue 3D NAND',
        //   'Crucial MX500',
        //   'Seagate Barracuda',
        //   'Kingston A2000',
        //   'SanDisk Ultra 3D',
        //   'Intel 660p',
        //   'ADATA XPG SX8200',
        //   'Corsair Force MP510',
        //   'Team Group MP33'
        // ],
        // 'Computing': [
        //   'Intel Core i7-10700K',
        //   'AMD Ryzen 7 5800X',
        //   'Intel Core i5-10600K',
        //   'AMD Ryzen 5 5600X',
        //   'Intel Core i9-10900K',
        //   'AMD Ryzen 9 5900X',
        //   'Intel Core i3-10100',
        //   'AMD Ryzen 3 3300X',
        //   'Intel Core i7-11700K',
        //   'AMD Ryzen 7 5800X'
        // ]
      };

      const names = categoryProductNames[category] || [];
      setExistingProductNames(names);
    } catch (error) {
      console.error("Failed to load existing product names:", error);
      setExistingProductNames([]);
    }
  };

  useEffect(() => {
    if (product) {
      setFormData(product);
      setSpecifications(product.specifications || {});
      setSelectedProductName(product.name);
    } else if (isOpen && !product) {
      // Reset form for adding new product
      setFormData({
        id: Date.now().toString(),
        name: "",
        brand: "",
        brandDescription: "",
        brandLogo: "",
        supplier: "",
        addedDate: new Date().toISOString().split("T")[0],
        buypricePerUnit: 0,
        sellpricePerUnit: 0,
        stock: 0,
        unit: "",
        category: "",
        rating: 0,
        image: "",
        description: "",
        specifications: {},
        commonId: "",
        uniqueId: "",
      });
      setSpecifications({});
      setSelectedProductName("");
      setCommonIdValidation({ isValid: true, message: "" });
      setUniqueIdValidation({ isValid: true, message: "" });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: [
        "sellpricePerUnit",
        "buypricePerUnit",
        "stock",
        "rating",
      ].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));

    // Validate IDs when they change
    if (name === "commonId") {
      const validation = validateCommonId(value);
      setCommonIdValidation(validation);

      // Auto-generate unique ID if common ID is valid and unique ID is empty
      if (validation.isValid && !formData.uniqueId) {
        const generatedUniqueId = generateUniqueId(value);
        setFormData((prev) => ({ ...prev, uniqueId: generatedUniqueId }));
        setUniqueIdValidation({
          isValid: true,
          message: "Unique ID generated",
        });
      }
    }

    if (name === "uniqueId") {
      const validation = validateUniqueId(value, product?.uniqueId);
      setUniqueIdValidation(validation);
    }
  };

  const handleProductNameSelect = (productName: string) => {
    setSelectedProductName(productName);
    setFormData((prev) => ({ ...prev, name: productName }));
    setShowProductNameDropdown(false);
  };

  const handleProductNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedProductName(value);
    setFormData((prev) => ({ ...prev, name: value }));
    setShowProductNameDropdown(true);
  };

  const generateNewUniqueId = () => {
    if (formData.commonId) {
      const newUniqueId = generateUniqueId(formData.commonId);
      setFormData((prev) => ({ ...prev, uniqueId: newUniqueId }));
      setUniqueIdValidation({
        isValid: true,
        message: "New Unique ID generated",
      });
    }
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecifications((prev) => ({
        ...prev,
        [newSpecKey.trim()]: newSpecValue.trim(),
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setSpecifications((prev) => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const handleSave = () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }
    if (!formData.category) {
      alert("Category is required");
      return;
    }
    if (formData.sellpricePerUnit <= 0) {
      alert("Price must be greater than 0");
      return;
    }
    if (!formData.commonId.trim()) {
      alert("Common ID is required");
      return;
    }
    if (!formData.uniqueId.trim()) {
      alert("Unique ID is required");
      return;
    }

    // Validate IDs
    const commonIdValid = validateCommonId(formData.commonId);
    const uniqueIdValid = validateUniqueId(
      formData.uniqueId,
      product?.uniqueId
    );

    if (!commonIdValid.isValid) {
      alert(`Common ID Error: ${commonIdValid.message}`);
      return;
    }

    if (!uniqueIdValid.isValid) {
      alert(`Unique ID Error: ${uniqueIdValid.message}`);
      return;
    }

    // If editing, remove old unique ID from used set
    if (product?.uniqueId && product.uniqueId !== formData.uniqueId) {
      removeUsedUniqueId(product.uniqueId);
    }

    // Add new unique ID to used set
    addUsedUniqueId(formData.uniqueId);

    const updatedProduct = {
      ...formData,
      specifications,
      commonId: formatCommonId(formData.commonId),
      uniqueId: formatUniqueId(formData.uniqueId),
    };

    console.log("Saving product:", updatedProduct); // Debug log
    onSave(updatedProduct);
    onClose();
  };

  // Add New Product
  // Add a new product to inventory

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl max-w-4xl w-full max-h-[100vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {product ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-slate-400">
                  {product
                    ? "Update product information"
                    : "Add a new product to inventory"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Name Selection */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-cyan-400" />
                  Product Name Selection
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => {
                        handleInputChange(e);
                        setNetworkItem("");
                        // Reset brand when category changes
                        setFormData((prev) => ({ ...prev, brand: "" }));
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                      required
                    >
                      <option value="" className="bg-slate-800">
                        Select Category
                      </option>
                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.name}
                          className="bg-slate-800"
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand Selection for all categories */}
                  {formData.category && (
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Brand
                      </label>
                      <select
                        name="brand"
                        value={formData.brand}
                        onChange={(e) => {
                          const selectedBrandName = e.target.value;
                          const selectedBrand = brands.find(
                            (brand) => brand.name === selectedBrandName
                          );

                          // Update formData with brand information from database
                          setFormData((prev) => ({
                            ...prev,
                            brand: selectedBrandName,
                            brandDescription: selectedBrand?.description || "",
                            brandLogo:
                              selectedBrand?.logoUrl ||
                              selectedBrand?.logoFile ||
                              "",
                          }));

                          // Call existing handler if needed
                          handleBrandSelection(selectedBrandName);
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      >
                        <option value="" className="bg-slate-800">
                          Select Brand
                        </option>
                        {brands.map((brand) => (
                          <option
                            key={brand.id}
                            value={brand.name}
                            className="bg-slate-800"
                          >
                            {brand.name}
                          </option>
                        ))}
                      </select>

                      {/* Display selected brand info */}
                      {formData.brand && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                          <div className="flex items-start space-x-3">
                            {(() => {
                              const selectedBrand = brands.find(
                                (brand) => brand.name === formData.brand
                              );
                              const logoUrl =
                                selectedBrand?.logoUrl ||
                                (selectedBrand?.logoFile
                                  ? `https://offline-inventory-api-with-fs.onrender.com/uploads/logos/${selectedBrand.logoFile}`
                                  : null);

                              return (
                                <>
                                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {logoUrl ? (
                                      <img
                                        src={logoUrl}
                                        alt={`${formData.brand} logo`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                          target.nextElementSibling?.classList.remove(
                                            "hidden"
                                          );
                                        }}
                                      />
                                    ) : null}
                                    <Building2
                                      className={`w-5 h-5 text-slate-900 ${
                                        logoUrl ? "hidden" : ""
                                      }`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className="text-cyan-400 font-semibold">
                                        {formData.brand}
                                      </p>
                                      <div
                                        className="w-2 h-2 bg-green-400 rounded-full"
                                        title="Brand data loaded from database"
                                      ></div>
                                    </div>
                                    {selectedBrand?.description ? (
                                      <p className="text-slate-400 text-sm leading-relaxed">
                                        {selectedBrand.description}
                                      </p>
                                    ) : (
                                      <p className="text-slate-500 text-sm">
                                        No description available
                                      </p>
                                    )}
                                    <p className="text-slate-500 text-xs mt-1">
                                      Brand data auto-populated • Added{" "}
                                      {selectedBrand?.createdDate
                                        ? new Date(
                                            selectedBrand.createdDate
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Network Items Dropdown - only for Network category */}
                  {formData.category === "Network" && (
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Network Item
                      </label>
                      <select
                        value={networkItem}
                        onChange={(e) => {
                          setNetworkItem(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            networkItem: e.target.value,
                          }));
                        }}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      >
                        <option value="" className="bg-slate-800">
                          Select Network Item
                        </option>
                        {networkItems.map((item) => (
                          <option
                            key={item}
                            value={item}
                            className="bg-slate-800"
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Product Name Input */}
                  <div className="relative">
                    <label className="block text-slate-400 text-sm mb-2">
                      Product Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedProductName}
                        onChange={handleProductNameInput}
                        placeholder="Type to search or select from existing products"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      />
                      {showProductNameDropdown &&
                        existingProductNames.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {existingProductNames
                              .filter((name) =>
                                name
                                  .toLowerCase()
                                  .includes(selectedProductName.toLowerCase())
                              )
                              .map((name, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleProductNameSelect(name)}
                                  className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                                >
                                  {name}
                                </button>
                              ))}
                          </div>
                        )}
                    </div>
                    {formData.category && existingProductNames.length > 0 && (
                      <p className="text-slate-400 text-xs mt-1">
                        Found {existingProductNames.length} existing products in{" "}
                        {formData.category} category
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Identification */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Fingerprint className="w-5 h-5 mr-2 text-cyan-400" />
                  Product Identification
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Common ID (Group ID)
                    </label>
                    <input
                      type="text"
                      name="commonId"
                      value={formData.commonId}
                      onChange={handleInputChange}
                      placeholder="e.g., CAM-1001"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all ${
                        commonIdValidation.isValid
                          ? "border-white/20 focus:border-cyan-400/50"
                          : "border-red-500/50 focus:border-red-500/50"
                      }`}
                      required
                    />
                    {!commonIdValidation.isValid && (
                      <p className="text-red-400 text-xs mt-1">
                        {commonIdValidation.message}
                      </p>
                    )}
                    {commonIdValidation.isValid && formData.commonId && (
                      <p className="text-green-400 text-xs mt-1">
                        ✓ {commonIdValidation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Unique ID (Serial ID)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="uniqueId"
                        value={formData.uniqueId}
                        onChange={handleInputChange}
                        placeholder="Auto-generated or manual entry"
                        className={`flex-1 px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all ${
                          uniqueIdValidation.isValid
                            ? "border-white/20 focus:border-cyan-400/50"
                            : "border-red-500/50 focus:border-red-500/50"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={generateNewUniqueId}
                        className="px-3 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all"
                        title="Generate new Unique ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {!uniqueIdValidation.isValid && (
                      <p className="text-red-400 text-xs mt-1">
                        {uniqueIdValidation.message}
                      </p>
                    )}
                    {uniqueIdValidation.isValid && formData.uniqueId && (
                      <p className="text-green-400 text-xs mt-1">
                        ✓ {uniqueIdValidation.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-xs">
                      <strong>Note:</strong> Common ID groups identical
                      products. Unique ID identifies each physical unit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-cyan-400" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Product ID
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                      disabled
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Supplier
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-cyan-400" />
                  Pricing & Stock
                </h3>

                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                      <label className="block text-slate-400 text-sm mb-2">
                        Purchase Price (৳)
                      </label>
                      <input
                        type="number"
                        name="buypricePerUnit"
                        value={formData.buypricePerUnit}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      />
                    </div>

                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                      <label className="block text-slate-400 text-sm mb-2">
                        Sell Price (৳)
                      </label>
                      <input
                        type="number"
                        name="sellpricePerUnit"
                        value={formData.sellpricePerUnit}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      />
                    </div>

                    {/* <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                      <label className="block text-slate-400 text-sm mb-2">Stock Quantity</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      />
                    </div> */}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Unit
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        placeholder="e.g., piece, kg, liter"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-sm mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        min="1"
                        max="5"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Product Image */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-cyan-400" />
                  Product Image & Description
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-sm mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter product description..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Hash className="w-5 h-5 mr-2 text-cyan-400" />
                  Specifications
                </h3>

                <div className="space-y-4">
                  {/* Add new specification */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Specification name"
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    />
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Specification value"
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    />
                  </div>

                  <button
                    onClick={addSpecification}
                    className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all"
                  >
                    Add Specification
                  </button>

                  {/* Display existing specifications */}
                  {Object.keys(specifications).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-slate-400 text-sm font-medium">
                        Current Specifications:
                      </h4>
                      {Object.entries(specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between bg-slate-700/30 rounded-lg p-2"
                        >
                          <div className="flex-1">
                            <span className="text-white font-medium">
                              {key}:
                            </span>
                            <span className="text-slate-300 ml-2">{value}</span>
                          </div>
                          <button
                            onClick={() => removeSpecification(key)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-t border-slate-700/30  p-6">
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 rounded-xl transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {product ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;
