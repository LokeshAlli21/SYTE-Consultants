import { 
  Plus, 
  Clock, 
  User, 
  Users, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Award, 
  X, 
  FileText, 
  Send, 
  Mail,
  HelpCircle 
} from 'lucide-react';

const getStatusColor = (status) => {
  const colors = {
    'new': 'bg-blue-50 text-blue-800 border-blue-200',
    'info-pending-syte': 'bg-amber-50 text-amber-800 border-amber-200',
    'info-pending-client': 'bg-yellow-50 text-yellow-800 border-yellow-200',
    'info-pending-cp': 'bg-orange-50 text-orange-800 border-orange-200',
    'govt-fees-pending': 'bg-orange-50 text-orange-800 border-orange-200',
    'application-done': 'bg-green-50 text-green-800 border-green-200',
    'scrutiny-raised': 'bg-red-50 text-red-800 border-red-200',
    'scrutiny-raised-d1': 'bg-red-50 text-red-800 border-red-200',
    'app-pending-d1': 'bg-red-100 text-red-800 border-red-300',
    'scrutiny-raised-d2': 'bg-red-100 text-red-800 border-red-300',
    'app-pending-d2': 'bg-red-200 text-red-800 border-red-300',
    'scrutiny-raised-d3': 'bg-red-200 text-red-800 border-red-300',
    'app-pending-d3': 'bg-red-300 text-gray-100 border-red-400',
    'scrutiny-raised-d4': 'bg-red-300 text-gray-100 border-red-400',
    'app-pending-d4': 'bg-red-400 text-gray-100 border-red-500',
    'app-pending': 'bg-red-300 text-gray-100 border-red-400',
    'certificate-generated': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'close': 'bg-gray-100 text-gray-800 border-gray-300',
    'qpr-submitted': 'bg-purple-100 text-purple-800 border-purple-300',
    'form-5-submitted': 'bg-purple-200 text-purple-900 border-purple-400',
    'form-2a-submitted': 'bg-purple-300 text-purple-900 border-purple-500',
    'work-done': 'bg-green-300 text-green-900 border-green-500',
    'reply-to-notice-sent': 'bg-pink-100 text-pink-800 border-pink-300',
    'email-sent-to-authority': 'bg-blue-200 text-blue-900 border-blue-400'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusIcon = (status) => {
  const icons = {
    'new': <Plus className="w-4 h-4" />,
    'info-pending-syte': <Clock className="w-4 h-4" />,
    'info-pending-client': <User className="w-4 h-4" />,
    'info-pending-cp': <Users className="w-4 h-4" />,
    'govt-fees-pending': <CreditCard className="w-4 h-4" />,
    'application-done': <CheckCircle className="w-4 h-4" />,
    'scrutiny-raised': <AlertTriangle className="w-4 h-4" />,
    'scrutiny-raised-d1': <AlertTriangle className="w-4 h-4" />,
    'app-pending-d1': <Clock className="w-4 h-4" />,
    'scrutiny-raised-d2': <AlertTriangle className="w-4 h-4" />,
    'app-pending-d2': <Clock className="w-4 h-4" />,
    'scrutiny-raised-d3': <AlertTriangle className="w-4 h-4" />,
    'app-pending-d3': <Clock className="w-4 h-4" />,
    'scrutiny-raised-d4': <AlertTriangle className="w-4 h-4" />,
    'app-pending-d4': <Clock className="w-4 h-4" />,
    'app-pending': <Clock className="w-4 h-4" />,
    'certificate-generated': <Award className="w-4 h-4" />,
    'close': <X className="w-4 h-4" />,
    'qpr-submitted': <FileText className="w-4 h-4" />,
    'form-5-submitted': <FileText className="w-4 h-4" />,
    'form-2a-submitted': <FileText className="w-4 h-4" />,
    'work-done': <CheckCircle className="w-4 h-4" />,
    'reply-to-notice-sent': <Send className="w-4 h-4" />,
    'email-sent-to-authority': <Mail className="w-4 h-4" />
  };
  return icons[status] || <HelpCircle className="w-4 h-4" />;
};

// Export the functions
export { getStatusColor, getStatusIcon };