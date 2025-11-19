import React, { useState } from 'react';
import { DataService } from '../../services/api';
import { Lock, Unlock, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  

  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "123456") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("סיסמה שגויה, נסה שנית.");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSuccessMsg("");
    
    try {
      await DataService.uploadGalleryPhoto(file);
      setSuccessMsg(`התמונה "${file.name}" עלתה בהצלחה לגלריה!`);

    } catch (err) {
      alert("שגיאה בהעלאה");
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-lightgray text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-secondary w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-heading font-bold mb-2 text-primary">Admin Access</h2>
          <p className="text-secondary mb-8 text-sm">Please enter your password to manage the portfolio.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
              autoFocus
            />
            
            {error && <p className="text-red-500 text-sm font-medium shake-animation">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-black transition-all flex items-center justify-center gap-2"
            >
              <Unlock size={18} />
              <span>Login</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <header className="flex items-center justify-between mb-12 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Dashboard</h1>
          <p className="text-secondary">Manage your gallery and content.</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="text-sm text-red-500 hover:text-red-700 font-medium underline"
        >
          Logout
        </button>
      </header>

      <div className="grid gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="text-accent" size={24} />
            <h2 className="text-xl font-bold">Upload to Gallery</h2>
          </div>
          
          <div className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
            ${uploading ? 'bg-gray-50 border-gray-300' : 'border-accent/30 hover:border-accent hover:bg-blue-50/50'}
          `}>
            <input 
              type="file" 
              id="gallery-upload" 
              className="hidden" 
              onChange={handleUpload} 
              accept="image/*"
              disabled={uploading}
            />
            
            <label htmlFor="gallery-upload" className={`cursor-pointer flex flex-col items-center gap-4 ${uploading ? 'cursor-not-allowed' : ''}`}>
              {uploading ? (
                <>
                  <Loader2 size={48} className="text-accent animate-spin" />
                  <span className="text-secondary font-medium">Uploading to server...</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 text-accent rounded-full flex items-center justify-center">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <span className="text-accent font-bold text-lg block">Click to Upload</span>
                    <span className="text-secondary text-sm">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                  </div>
                </>
              )}
            </label>
          </div>
          {successMsg && (
            <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {successMsg}
            </div>
          )}
        </div>

        {}
      </div>
    </div>
  );
};

export default AdminPage;