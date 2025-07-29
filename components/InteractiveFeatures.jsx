import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  Heart, 
  Send, 
  Reply, 
  Bell, 
  User,
  Clock,
  CheckCircle
} from 'lucide-react';

const InteractiveFeatures = ({ token, user, reportId, reportTitle }) => {
  const [comments, setComments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (reportId) {
      loadComments();
    }
    loadNotifications();
  }, [reportId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) {
      setMessage('يرجى كتابة تعليق');
      return;
    }

    if (!user.is_activated) {
      setMessage('يجب تفعيل الحساب أولاً للتعليق');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment,
          parent_id: replyTo?.id
        })
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        setMessage('تم إضافة التعليق بنجاح');
        loadComments();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'حدث خطأ في إضافة التعليق');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
    setLoading(false);
  };

  const toggleLike = async (commentId) => {
    if (!user.is_activated) {
      setMessage('يجب تفعيل الحساب أولاً للإعجاب');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadComments(); // Reload to get updated like counts
      } else {
        const data = await response.json();
        setMessage(data.error || 'حدث خطأ في الإعجاب');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar');
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Notifications Panel */}
      <Card>
        <CardHeader>
          <div className=\"flex items-center justify-between\">
            <CardTitle className=\"flex items-center gap-2\">
              <Bell className=\"h-5 w-5\" />
              الإشعارات
              {unreadNotifications.length > 0 && (
                <Badge variant=\"destructive\" className=\"ml-2\">
                  {unreadNotifications.length}
                </Badge>
              )}
            </CardTitle>
            {unreadNotifications.length > 0 && (
              <Button
                size=\"sm\"
                variant=\"outline\"
                onClick={markAllNotificationsRead}
              >
                تحديد الكل كمقروء
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className=\"space-y-3 max-h-64 overflow-y-auto\">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => !notification.is_read && markNotificationRead(notification.id)}
              >
                <div className=\"flex items-start justify-between\">
                  <div className=\"flex-1\">
                    <div className=\"font-medium text-sm\">{notification.title}</div>
                    <div className=\"text-sm text-gray-600 mt-1\">{notification.message}</div>
                  </div>
                  <div className=\"flex items-center gap-2 text-xs text-gray-500\">
                    <Clock className=\"h-3 w-3\" />
                    {formatTimeAgo(notification.created_at)}
                    {!notification.is_read && (
                      <div className=\"w-2 h-2 bg-blue-500 rounded-full\"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className=\"text-center text-gray-500 py-4\">
                لا توجد إشعارات
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {reportId && (
        <Card>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <MessageCircle className=\"h-5 w-5\" />
              التعليقات على تقرير: {reportTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            {/* Comment Form */}
            <div className=\"space-y-3\">
              {replyTo && (
                <div className=\"bg-gray-50 p-3 rounded border-l-4 border-blue-500\">
                  <div className=\"text-sm text-gray-600\">
                    رد على تعليق {replyTo.user_name}:
                  </div>
                  <div className=\"text-sm mt-1\">{replyTo.content.substring(0, 100)}...</div>
                  <Button
                    size=\"sm\"
                    variant=\"ghost\"
                    onClick={() => setReplyTo(null)}
                    className=\"mt-2\"
                  >
                    إلغاء الرد
                  </Button>
                </div>
              )}
              
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? 'اكتب ردك...' : 'اكتب تعليقك...'}
                rows={3}
                disabled={!user.is_activated}
              />
              
              {!user.is_activated && (
                <Alert>
                  <AlertDescription>
                    يجب تفعيل حسابك أولاً للتعليق. يرجى الحصول على كود التفعيل من قائد الفريق.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={submitComment}
                disabled={loading || !user.is_activated}
                className=\"flex items-center gap-2\"
              >
                <Send className=\"h-4 w-4\" />
                {loading ? 'جاري الإرسال...' : (replyTo ? 'إرسال الرد' : 'إرسال التعليق')}
              </Button>
            </div>

            {/* Comments List */}
            <div className=\"space-y-4\">
              {comments.map((comment) => (
                <div key={comment.id} className=\"border rounded p-4\">
                  <div className=\"flex items-start justify-between mb-2\">
                    <div className=\"flex items-center gap-2\">
                      <div className=\"w-8 h-8 bg-green-100 rounded-full flex items-center justify-center\">
                        <User className=\"h-4 w-4 text-green-600\" />
                      </div>
                      <div>
                        <div className=\"font-medium text-sm\">
                          {comment.user_full_name || comment.user_name}
                        </div>
                        <div className=\"text-xs text-gray-500\">
                          {formatTimeAgo(comment.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className=\"mb-3 text-sm\">{comment.content}</div>
                  
                  <div className=\"flex items-center gap-3\">
                    <Button
                      size=\"sm\"
                      variant=\"ghost\"
                      onClick={() => toggleLike(comment.id)}
                      className=\"flex items-center gap-1 text-xs\"
                      disabled={!user.is_activated}
                    >
                      <Heart className=\"h-3 w-3\" />
                      {comment.likes_count || 0}
                    </Button>
                    
                    <Button
                      size=\"sm\"
                      variant=\"ghost\"
                      onClick={() => setReplyTo(comment)}
                      className=\"flex items-center gap-1 text-xs\"
                      disabled={!user.is_activated}
                    >
                      <Reply className=\"h-3 w-3\" />
                      رد
                    </Button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className=\"mt-4 ml-6 space-y-3 border-l-2 border-gray-200 pl-4\">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className=\"bg-gray-50 rounded p-3\">
                          <div className=\"flex items-center gap-2 mb-2\">
                            <div className=\"w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center\">
                              <User className=\"h-3 w-3 text-blue-600\" />
                            </div>
                            <div className=\"font-medium text-sm\">
                              {reply.user_full_name || reply.user_name}
                            </div>
                            <div className=\"text-xs text-gray-500\">
                              {formatTimeAgo(reply.created_at)}
                            </div>
                          </div>
                          <div className=\"text-sm\">{reply.content}</div>
                          <Button
                            size=\"sm\"
                            variant=\"ghost\"
                            onClick={() => toggleLike(reply.id)}
                            className=\"flex items-center gap-1 text-xs mt-2\"
                            disabled={!user.is_activated}
                          >
                            <Heart className=\"h-3 w-3\" />
                            {reply.likes_count || 0}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className=\"text-center text-gray-500 py-8\">
                  لا توجد تعليقات بعد. كن أول من يعلق!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveFeatures;

