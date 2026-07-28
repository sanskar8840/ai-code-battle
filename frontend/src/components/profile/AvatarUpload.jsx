import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiCamera } from "react-icons/fi";
import dashboardService from "../../services/dashboardService";
import Spinner from "../common/Spinner";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * onUploaded(avatar) is called with { url, publicId } once the upload succeeds,
 * so the parent can update Redux/local state.
 */
const AvatarUpload = ({ name, currentUrl, onUploaded }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, WEBP, or GIF image");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setIsUploading(true);

    try {
      const avatar = await dashboardService.uploadAvatar(file);
      setPreview(avatar.url);
      onUploaded?.(avatar);
      toast.success("Avatar updated");
    } catch (err) {
      setPreview(currentUrl || "");
      toast.error(
        err.message?.includes("Cloudinary")
          ? "Avatar upload isn't configured yet — add your Cloudinary keys to backend/.env"
          : err.message || "Upload failed"
      );
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  return (
    <div className="relative h-20 w-20 shrink-0">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-duel-500/10 font-display text-2xl font-bold text-duel-500">
        {preview ? (
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          name?.charAt(0).toUpperCase() || "?"
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Change avatar"
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-paper-50 bg-duel-500 text-white shadow-sm transition-transform hover:scale-105 disabled:opacity-60 dark:border-ink-900"
      >
        {isUploading ? <Spinner size="sm" className="text-white" /> : <FiCamera size={14} />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
