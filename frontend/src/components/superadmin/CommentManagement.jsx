import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Search, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    filterComments();
  }, [comments, searchTerm]);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/v1/superadmin/comments', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      } else {
        toast.error(data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error loading comments');
    } finally {
      setLoading(false);
    }
  };

  const filterComments = () => {
    let filtered = comments;

    if (searchTerm) {
      filtered = filtered.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${comment.userId.firstName} ${comment.userId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.postId.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComments(filtered);
  };

  const handleDeleteComment = async (commentId, commentContent) => {
    try {
      const response = await fetch(`/api/v1/superadmin/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      if (data.success) {
        setComments(comments.filter(comment => comment._id !== commentId));
        toast.success('Comment deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comment Management
        </CardTitle>
        <CardDescription>
          Manage all comments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Control */}
        <div className="relative flex-1 mb-6">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments by content, user, or post..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Comments Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredComments.map((comment) => (
                  <TableRow key={comment._id}>
                    <TableCell>{truncateText(comment.content, 60)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{comment.userId.firstName} {comment.userId.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{truncateText(comment.postId.title, 40)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Delete Comment */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this comment? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment._id, comment.content)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Comment
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredComments.length} of {comments.length} comments
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentManagement;

