import React, { useEffect, useState } from 'react';
import { Clock, User, MessageSquare, Bell, CheckCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import { useParams } from 'react-router-dom';
import databaseService from '../backend-services/database/database';
import { getStatusColor, getStatusIcon } from '../components/assignment-dashboard-components/GetStatusColor&Icon'
import { NotesDisplay, DynamicNotesDisplay } from '../components/assignment-dashboard-components/NotesDisplay';

function AssignmentTimeLine() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchTimeline = async () => {
    try {
      const response = await databaseService.getAssignmentTimeline(id);
      setTimeline(response.timeline || []);
    } catch (err) {
      setError('Failed to load assignment timeline.');
    } finally {
      setLoading(false);
    }
  };
  fetchTimeline();
}, [id]);

  const getEventIcon = (eventType) => {
    const icons = {
      'assignment_created': <FileText className="w-4 h-4" />,
      'status_changed': <CheckCircle className="w-4 h-4" />,
      'note_added': <MessageSquare className="w-4 h-4" />,
      'follow_up': <Bell className="w-4 h-4" />
    };
    return icons[eventType] || <Clock className="w-4 h-4" />;
  };

  const formatStatusName = (status) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNoteContent = (note) => {
    if (!note) return null;

    return (
      <>
      {/* <NotesDisplay note={note} /> */}
      <DynamicNotesDisplay note={note} />
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!timeline.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No timeline data available</p>
      </div>
    );
  }

  // Process timeline data for grouping by status
  const processedTimeline = timeline.map(assignment => ({
    ...assignment,
    timeline_by_status: assignment.timeline_by_status
      .map(statusGroup => ({
        ...statusGroup,
        events: statusGroup.events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }))
      .sort((a, b) => {
        // Sort status groups by the most recent event in each group
        const aLatest = new Date(a.events[0]?.created_at || 0);
        const bLatest = new Date(b.events[0]?.created_at || 0);
        return bLatest - aLatest;
      })
  }));

  // Calculate total events for stats
  const totalEvents = timeline.reduce((acc, assignment) => 
    acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
      statusAcc + status.events.length, 0), 0);

  return (
    <div className=" mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignment Timeline</h1>
        <p className="text-gray-600 mt-1">Track progress and status changes grouped by status</p>
      </div>
      {/* Summary stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalEvents}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">Notes Added</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {timeline.reduce((acc, assignment) => 
              acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
                statusAcc + status.events.filter(e => e.event_type === 'note_added').length, 0), 0)}
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-900">Follow-ups</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {timeline.reduce((acc, assignment) => 
              acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
                statusAcc + status.events.filter(e => e.event_type === 'follow_up').length, 0), 0)}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Status Changes</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {timeline.reduce((acc, assignment) => 
              acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
                statusAcc + status.events.filter(e => e.event_type === 'status_changed').length, 0), 0)}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {processedTimeline.map((assignment) => (
          <div key={assignment.assignment_id} className="space-y-6">
            {assignment.timeline_by_status.map((statusGroup, statusIndex) => (
              <div key={`${assignment.assignment_id}-${statusGroup.assignment_status}`} className="relative">
                {/* Status Header */}
                <div className="sticky top-0 z-20  py-4 mb-6">
                  <div className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold border-2 shadow-sm ${getStatusColor(statusGroup.assignment_status)}`}>
                    <div className="mr-3">
                      {getStatusIcon(statusGroup.assignment_status)}
                    </div>
                    <span>{formatStatusName(statusGroup.assignment_status)}</span>
                    <span className="ml-3 bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                      {statusGroup.events.length} event{statusGroup.events.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Events in this status */}
                <div className="relative ml-4">
                  {/* Status timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-4">
                    {statusGroup.events.map((event, eventIndex) => (
                      <div key={event.id} className="relative flex items-start">
                        {/* Event dot */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full border-3 border-white shadow-md flex items-center justify-center z-10 ${
                          event.event_type === 'assignment_created' ? 'bg-blue-500' :
                          event.event_type === 'status_changed' ? 'bg-green-500' :
                          event.event_type === 'note_added' ? 'bg-purple-500' :
                          event.event_type === 'follow_up' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          <div className="text-white">
                            {getEventIcon(event.event_type)}
                          </div>
                        </div>

                        {/* Event Content */}
                        <div className="ml-6 flex-1 min-w-0">
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            {/* Event Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                  event.event_type === 'assignment_created' ? 'bg-blue-100 text-blue-800' :
                                  event.event_type === 'status_changed' ? 'bg-green-100 text-green-800' :
                                  event.event_type === 'note_added' ? 'bg-purple-100 text-purple-800' :
                                  event.event_type === 'follow_up' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {event.event_type.replace('_', ' ')}
                                </span>
                              </div>
                              <time className="text-sm text-gray-500">
                                {formatDate(event.created_at)}
                              </time>
                            </div>

                            {/* User info */}
                            <div className="flex items-center mb-3">
                              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-blue-600" />
                              </div>
                              <div className="ml-2">
                                <p className="text-sm font-medium text-gray-900">{event.updated_user.name}</p>
                                <p className="text-xs text-gray-500">{event.updated_user.email}</p>
                              </div>
                            </div>

                            {/* Notes content */}
                            {event.note && renderNoteContent(event.note)}

                            {/* Source type indicator */}
                            <div className="mt-3 flex items-center justify-between">
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                event.source_type === 'timeline' ? 'bg-gray-100 text-gray-700' :
                                event.source_type === 'reminder' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {event.source_type}
                              </span>
                              <span className="text-xs text-gray-400">ID: {event.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}

export default AssignmentTimeLine;