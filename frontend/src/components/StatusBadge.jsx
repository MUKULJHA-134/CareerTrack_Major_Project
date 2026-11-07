import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  XCircle,
  Eye,
  Archive
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'Submitted':
        return { className: 'badge-submitted', icon: <FileText size={13} />, label: 'Submitted' };
      case 'Under Review':
        return { className: 'badge-under-review', icon: <Clock size={13} />, label: 'Under Review' };
      case 'Shortlisted':
        return { className: 'badge-shortlisted', icon: <Award size={13} />, label: 'Shortlisted' };
      case 'Interview Scheduled':
        return { className: 'badge-interview-scheduled', icon: <Calendar size={13} />, label: 'Interview Scheduled' };
      case 'Selected':
        return { className: 'badge-selected', icon: <CheckCircle2 size={13} />, label: 'Selected' };
      case 'Rejected':
        return { className: 'badge-rejected', icon: <XCircle size={13} />, label: 'Rejected' };
      case 'Published':
        return { className: 'badge-published', icon: <Eye size={13} />, label: 'Published' };
      case 'Closed':
        return { className: 'badge-closed', icon: <XCircle size={13} />, label: 'Closed' };
      case 'Draft':
      case 'Unpublished':
        return { className: 'badge-draft', icon: <Archive size={13} />, label: status };
      default:
        return { className: 'badge-pill', icon: null, label: status || 'Unknown' };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
