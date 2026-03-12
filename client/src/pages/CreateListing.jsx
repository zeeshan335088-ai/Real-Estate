import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file input
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Upload images to Cloudinary
  const handleImageSubmit = async () => {
    if (files.length === 0) return setImageUploadError("No images selected");
    if (files.length + formData.imageUrls.length > 6)
      return setImageUploadError("You can only upload 6 images per listing");

    // Validate file sizes (5MB max)
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError(`${file.name} is too large (max 5 MB)`);
        return;
      }
    }

    setUploading(true);
    setImageUploadError("");

    try {
      const uploadedUrls = [];

      for (let file of files) {
        const data = new FormData();
        data.append("file", file);

        // ✅ Replace with your Cloudinary unsigned preset
        data.append("upload_preset", "unsigned_profile_upload");

        const res = await fetch(
          // ✅ Replace with your Cloudinary cloud name
          "https://api.cloudinary.com/v1_1/dmzx36hxd/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error?.message || "Upload failed");
        }

        uploadedUrls.push(json.secure_url);
      }

      setFormData({
        ...formData,
        imageUrls: [...formData.imageUrls, ...uploadedUrls],
      });

      setFiles([]);
    } catch (err) {
      console.error(err);
      setImageUploadError("Image upload failed. Check your preset and Cloud name.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    if (id === "sale" || id === "rent") return setFormData({ ...formData, type: id });
    if (id === "parking" || id === "furnished" || id === "offer")
      return setFormData({ ...formData, [id]: checked });
    if (type === "text" || type === "number" || type === "textarea")
      return setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) return setError("Upload at least 1 image");
    if (+formData.discountPrice > +formData.regularPrice)
      return setError("Discount price must be lower than regular price");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userRef: currentUser._id },
          {
               credentials: true
          }
        ),
      });
      const data = await res.json();
      setLoading(false);

      if (!data.success) return setError(data.message);
      navigate(`/listing/${data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* Left Side */}
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg"
            required
            minLength={10}
            maxLength={62}
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="text"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
            value={formData.address}
            onChange={handleChange}
          />

          {/* Checkboxes */}
          <div className="flex gap-6 flex-wrap">
            {["sale", "rent", "parking", "furnished", "offer"].map((field) => (
              <div className="flex gap-2" key={field}>
                <input
                  type="checkbox"
                  id={field}
                  className="w-5"
                  checked={
                    field === "sale"
                      ? formData.type === "sale"
                      : field === "rent"
                      ? formData.type === "rent"
                      : formData[field]
                  }
                  onChange={handleChange}
                />
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
              </div>
            ))}
          </div>

          {/* Numbers */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                className="p-3 border rounded-lg"
                required
                value={formData.bedrooms}
                onChange={handleChange}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min={1}
                max={10}
                className="p-3 border rounded-lg"
                required
                value={formData.bathrooms}
                onChange={handleChange}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min={50}
                max={10000000}
                className="p-3 border rounded-lg"
                required
                value={formData.regularPrice}
                onChange={handleChange}
              />
              <p>Regular price</p>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min={0}
                  max={10000000}
                  className="p-3 border rounded-lg"
                  required
                  value={formData.discountPrice}
                  onChange={handleChange}
                />
                <p>Discounted price</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="text-gray-600 ml-2">Max 6 images, 5 MB each</span>
          </p>
          <div className="flex gap-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="border p-3 rounded w-full"
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={uploading}
              className="border text-green-700 p-3 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {imageUploadError && <p className="text-red-700">{imageUploadError}</p>}

          {formData.imageUrls.map((url, index) => (
            <div key={index} className="flex items-center justify-between p-3 border">
              <img src={url} alt="listing" className="w-20 h-20 object-contain rounded-lg" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-3 text-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create listing"}
          </button>
          {error && <p className="text-red-700">{error}</p>}
        </div>
      </form>
    </main>
  );
}