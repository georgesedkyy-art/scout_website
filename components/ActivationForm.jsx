import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, Key, User } from 'lucide-react';

const ActivationForm = ({ onActivationSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    activation_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase() // Convert activation code to uppercase
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.activation_code) {
      setError('يرجى إدخال اسم المستخدم وكود التفعيل');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/activate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('تم تفعيل الحساب بنجاح! يمكنك الآن تسجيل الدخول.');
        setFormData({ username: '', activation_code: '' });
        if (onActivationSuccess) {
          onActivationSuccess(data.user);
        }
      } else {
        setError(data.error || 'حدث خطأ في تفعيل الحساب');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    }

    setLoading(false);
  };

  const checkActivationStatus = async () => {
    if (!formData.username) {
      setError('يرجى إدخال اسم المستخدم أولاً');
      return;
    }

    try {
      const response = await fetch(`/api/check-activation-status/${formData.username}`);
      const data = await response.json();

      if (response.ok) {
        if (data.is_activated) {
          setMessage('الحساب مفعل مسبقاً. يمكنك تسجيل الدخول.');
        } else {
          setMessage('الحساب غير مفعل. يرجى إدخال كود التفعيل.');
        }
      } else {
        setError(data.error || 'المستخدم غير موجود');
      }
    } catch (error) {
      setError('حدث خطأ في التحقق من حالة التفعيل');
    }
  };

  return (
    <div className=\"max-w-md mx-auto\">
      <Card>
        <CardHeader className=\"text-center\">
          <div className=\"mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4\">
            <Key className=\"h-6 w-6 text-green-600\" />
          </div>
          <CardTitle>تفعيل الحساب</CardTitle>
          <CardDescription>
            أدخل اسم المستخدم وكود التفعيل لتفعيل حسابك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant=\"destructive\" className=\"mb-4\">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className=\"mb-4 border-green-200 bg-green-50 text-green-800\">
              <CheckCircle className=\"h-4 w-4\" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className=\"space-y-4\">
            <div className=\"space-y-2\">
              <Label htmlFor=\"username\">اسم المستخدم</Label>
              <div className=\"relative\">
                <User className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                <Input
                  id=\"username\"
                  name=\"username\"
                  type=\"text\"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder=\"أدخل اسم المستخدم\"
                  className=\"pl-10\"
                  required
                />
              </div>
              <Button
                type=\"button\"
                variant=\"outline\"
                size=\"sm\"
                onClick={checkActivationStatus}
                className=\"w-full\"
              >
                تحقق من حالة التفعيل
              </Button>
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"activation_code\">كود التفعيل</Label>
              <div className=\"relative\">
                <Key className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />
                <Input
                  id=\"activation_code\"
                  name=\"activation_code\"
                  type=\"text\"
                  value={formData.activation_code}
                  onChange={handleInputChange}
                  placeholder=\"أدخل كود التفعيل\"
                  className=\"pl-10 font-mono text-center tracking-wider\"
                  maxLength={20}
                  required
                />
              </div>
              <p className=\"text-sm text-gray-600\">
                احصل على كود التفعيل من قائد الفريق
              </p>
            </div>

            <Button
              type=\"submit\"
              disabled={loading}
              className=\"w-full\"
            >
              {loading ? 'جاري التفعيل...' : 'تفعيل الحساب'}
            </Button>
          </form>

          <div className=\"mt-6 text-center\">
            <p className=\"text-sm text-gray-600\">
              لديك حساب مفعل؟{' '}
              <button
                onClick={() => window.location.href = '#login'}
                className=\"text-green-600 hover:text-green-700 font-medium\"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivationForm;

