import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { useGroupStore } from '../../store/groupStore';
import { useDocumentStore } from '../../store/documentStore';
import { 
  FolderOpen, 
  File, 
  FileText, 
  Image, 
  Download, 
  Upload, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  Trash2,
  Edit,
  Eye,
  Share,
  Calendar,
  User,
  Tag
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text' | 'spreadsheet' | 'presentation' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  tags: string[];
  description?: string;
  isPublic: boolean;
  downloadCount: number;
}

const DocumentsSection = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'downloads'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const { activeGroup } = useGroupStore();
  const { 
    documents, 
    stats, 
    loading, 
    error, 
    fetchDocuments, 
    fetchStats, 
    uploadDocument, 
    deleteDocument, 
    downloadDocument 
  } = useDocumentStore();

  // Fetch documents and stats when active group changes
  useEffect(() => {
    if (activeGroup) {
      fetchDocuments(activeGroup.id);
      fetchStats(activeGroup.id);
    }
  }, [activeGroup, fetchDocuments, fetchStats]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'downloads':
        comparison = a.downloadCount - b.downloadCount;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
      case 'image': return <Image className="h-8 w-8 text-green-500" />;
      case 'text': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'spreadsheet': return <FileText className="h-8 w-8 text-green-600" />;
      case 'presentation': return <FileText className="h-8 w-8 text-orange-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add group ID
    if (activeGroup) {
      formData.append('groupId', activeGroup.id);
    }
    
    try {
      await uploadDocument(formData);
      setShowUploadModal(false);
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      await downloadDocument(documentId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const totalSize = stats?.totalSize || 0;
  const totalDownloads = stats?.totalDownloads || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Documents</h2>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Documents</p>
                <p className="text-lg font-semibold text-white">{stats?.totalDocuments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-full">
                <Download className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Downloads</p>
                <p className="text-lg font-semibold text-white">{totalDownloads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <File className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Storage Used</p>
                <p className="text-lg font-semibold text-white">{formatFileSize(totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Share className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Public Files</p>
                <p className="text-lg font-semibold text-white">
                  {stats?.publicDocuments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="text">Text</option>
          <option value="spreadsheet">Spreadsheets</option>
          <option value="presentation">Presentations</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="all">All Categories</option>
          <option value="Reports">Reports</option>
          <option value="Templates">Templates</option>
          <option value="Meeting Notes">Meeting Notes</option>
          <option value="Assets">Assets</option>
          <option value="Presentations">Presentations</option>
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as typeof sortBy);
            setSortOrder(order as typeof sortOrder);
          }}
          className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="size-desc">Largest First</option>
          <option value="size-asc">Smallest First</option>
          <option value="downloads-desc">Most Downloaded</option>
        </select>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Documents List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {getFileIcon(document.type)}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => handleDownload(document._id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-400"
                      onClick={() => handleDelete(document._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-white text-sm mb-2 truncate">
                  {document.name}
                </h3>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{document.formattedSize || formatFileSize(document.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads:</span>
                    <span>{document.downloadCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>{document.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{formatDate(document.uploadedAt)}</span>
                  </div>
                </div>
                {document.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {document.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {document.tags.length > 2 && (
                      <span className="text-xs text-slate-400">
                        +{document.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Name</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Type</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Size</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Category</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Uploaded</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Downloads</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="border-t border-slate-700">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(document.type)}
                          <div>
                            <div className="text-white font-medium">{document.name}</div>
                            {document.description && (
                              <div className="text-xs text-slate-400">{document.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 capitalize">{document.type}</td>
                      <td className="p-3 text-slate-300">{formatFileSize(document.size)}</td>
                      <td className="p-3 text-slate-300">{document.category}</td>
                      <td className="p-3 text-slate-300">{formatDate(document.uploadedAt)}</td>
                      <td className="p-3 text-slate-300">{document.downloadCount}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                            onClick={() => handleDelete(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredDocuments.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No documents found</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Document Name</Label>
                  <Input
                    id="name"
                    name="name"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-white">File Type</Label>
                  <select
                    id="type"
                    name="type"
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                    <option value="text">Text Document</option>
                    <option value="spreadsheet">Spreadsheet</option>
                    <option value="presentation">Presentation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <select
                    id="category"
                    name="category"
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Reports">Reports</option>
                    <option value="Templates">Templates</option>
                    <option value="Meeting Notes">Meeting Notes</option>
                    <option value="Assets">Assets</option>
                    <option value="Presentations">Presentations</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                  <Input
                    id="description"
                    name="description"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="e.g., financial, report, 2024"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    value="true"
                    className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isPublic" className="text-white">Make public</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Upload
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
