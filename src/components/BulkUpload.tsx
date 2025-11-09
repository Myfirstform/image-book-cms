import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FaUpload, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

interface BookData {
  title: string;
  description: string;
  price: string;
  image: File | null;
  imagePreview: string | null;
}

const BulkUpload = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [books, setBooks] = useState<BookData[]>([{
    title: '',
    description: '',
    price: '',
    image: null,
    imagePreview: null
  }]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addBook = () => {
    setBooks([...books, { title: '', description: '', price: '', image: null, imagePreview: null }]);
  };

  const removeBook = (index: number) => {
    const newBooks = [...books];
    newBooks.splice(index, 1);
    setBooks(newBooks);
  };

  const handleInputChange = (index: number, field: keyof BookData, value: string) => {
    const newBooks = [...books];
    newBooks[index] = { ...newBooks[index], [field]: value };
    setBooks(newBooks);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newBooks = [...books];
        newBooks[index] = {
          ...newBooks[index],
          image: file,
          imagePreview: reader.result as string
        } as BookData;
        setBooks(newBooks);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, bookTitle: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bookTitle.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `book-covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('book-covers')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate form
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      if (!book.title.trim() || !book.price || !book.image) {
        setError(`Book #${i + 1} is missing required fields`);
        return;
      }
      if (isNaN(parseFloat(book.price))) {
        setError(`Invalid price for book #${i + 1}`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalBooks = books.length;
      let successfulUploads = 0;

      for (let i = 0; i < totalBooks; i++) {
        const book = books[i];
        try {
          // Upload image first
          let imageUrl = '';
          if (book.image) {
            imageUrl = await uploadFile(book.image, book.title);
          }

          // Insert book data
          const { error } = await supabase
            .from('books')
            .insert([
              { 
                title: book.title,
                description: book.description,
                price: parseFloat(book.price),
                image_url: imageUrl
              },
            ]);

          if (error) throw error;

          successfulUploads++;
          setUploadProgress(Math.round((successfulUploads / totalBooks) * 100));
        } catch (err) {
          console.error(`Error uploading book #${i + 1}:`, err);
          setError(`Error uploading book "${book.title}": ${err.message}`);
          // Continue with next book even if one fails
          continue;
        }
      }

      setSuccess(`Successfully uploaded ${successfulUploads} out of ${totalBooks} books`);
      if (successfulUploads > 0) {
        onUploadComplete();
        // Reset form
        setBooks([{ title: '', description: '', price: '', image: null, imagePreview: null }]);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bulk-upload">
      <h2>Bulk Upload Publications</h2>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}>
        {books.map((book, index) => (
          <div key={index} className="book-upload-card">
            <div className="book-upload-header">
              <h3>Book #{index + 1}</h3>
              {books.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeBook(index)}
                  className="remove-button"
                  aria-label={`Remove book ${index + 1}`}
                >
                  <FaTrash />
                </button>
              )}
            </div>
            
            <div className="book-upload-grid">
              <div className="book-cover-upload">
                <div className="image-upload-preview">
                  {book.imagePreview ? (
                    <img src={book.imagePreview} alt={`Preview for ${book.title}`} />
                  ) : (
                    <div className="image-placeholder">
                      <FaUpload size={32} />
                      <span>Book Cover</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="file-input"
                  id={`image-upload-${index}`}
                />
                <label htmlFor={`image-upload-${index}`} className="upload-button">
                  Choose Image
                </label>
              </div>
              
              <div className="book-details">
                <div className="form-group">
                  <label htmlFor={`title-${index}`}>Title *</label>
                  <input
                    type="text"
                    id={`title-${index}`}
                    value={book.title}
                    onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                    placeholder="Book Title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`description-${index}`}>Description</label>
                  <textarea
                    id={`description-${index}`}
                    value={book.description}
                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    placeholder="Book Description"
                    rows={3}
                  />
                </div>
                
                <div className="form-group price-group">
                  <label htmlFor={`price-${index}`}>Price (₹) *</label>
                  <input
                    type="number"
                    id={`price-${index}`}
                    value={book.price}
                    onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={addBook}
            className="add-button"
          >
            <FaPlus /> Add Another Book
          </button>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isUploading}
          >
            {isUploading ? (
              `Uploading... ${uploadProgress}%`
            ) : (
              'Upload All Books'
            )}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>

      <style>{`
        .bulk-upload {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        h2 {
          color: #333;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .book-upload-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .book-upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .book-upload-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 2rem;
        }
        
        .book-cover-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .image-upload-preview {
          width: 100%;
          aspect-ratio: 2/3;
          border: 2px dashed #ddd;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 1rem;
          background-color: #f9f9f9;
        }
        
        .image-upload-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #999;
          padding: 1rem;
          text-align: center;
        }
        
        .file-input {
          display: none;
        }
        
        .upload-button {
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .upload-button:hover {
          background: #e0e0e0;
        }
        
        .book-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-group input[type="text"]:focus,
        .form-group input[type="number"]:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          gap: 1rem;
        }
        
        .add-button,
        .submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .add-button {
          background: #f0f0f0;
          color: #333;
        }
        
        .add-button:hover {
          background: #e0e0e0;
        }
        
        .submit-button {
          background: #3b82f6;
          color: white;
        }
        
        .submit-button:not(:disabled):hover {
          background: #2563eb;
        }
        
        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .remove-button {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .remove-button:hover {
          background: #fee2e2;
        }
        
        .error-message {
          margin-top: 1rem;
          padding: 1rem;
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 6px;
        }
        
        .success-message {
          margin-top: 1rem;
          padding: 1rem;
          background: #dcfce7;
          color: #166534;
          border-radius: 6px;
        }
        
        @media (max-width: 768px) {
          .book-upload-grid {
            grid-template-columns: 1fr;
          }
          
          .image-upload-preview {
            max-width: 200px;
            margin: 0 auto 1rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .add-button,
          .submit-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkUpload;
