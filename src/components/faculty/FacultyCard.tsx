import { motion } from 'framer-motion';

interface FacultyCardProps {
  id: string;
  name: string;
  designation: string;
  imageUrl: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const FacultyCard = ({
  id,
  name,
  designation,
  imageUrl,
  onEdit,
  onDelete,
  isAdmin = false,
}: FacultyCardProps) => {
  return (
    <motion.div
      className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-40 h-40 mb-4 overflow-hidden rounded-full border-4 border-emerald-100 group-hover:border-emerald-200 transition-colors duration-300">
        <img
          src={imageUrl || '/placeholder-avatar.png'}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-avatar.png';
          }}
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">{name}</h3>
      <p className="text-emerald-600 text-sm font-medium">{designation}</p>
      
      {isAdmin && (onEdit || onDelete) && (
        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FacultyCard;
