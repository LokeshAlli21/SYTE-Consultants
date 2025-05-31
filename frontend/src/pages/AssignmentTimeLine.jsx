import React, { useEffect, useState } from 'react';
import { Clock, User, MessageSquare, Bell, CheckCircle, AlertCircle, FileText, Calendar, Download } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import databaseService from '../backend-services/database/database';
import { getStatusColor, getStatusIcon } from '../components/assignment-dashboard-components/GetStatusColor&Icon'
import { NotesDisplay, DynamicNotesDisplay } from '../components/assignment-dashboard-components/NotesDisplay';
import { FaArrowLeft } from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver'

function AssignmentTimeLine() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate()

  // Export functions
  const exportToExcel = () => {
    const exportData = [];
    
    timeline.forEach(assignment => {
      assignment.timeline_by_status.forEach(statusGroup => {
        statusGroup.events.forEach(event => {
          const row = {
            'Assignment ID': assignment.assignment_id,
            'Status': formatStatusName(statusGroup.assignment_status),
            'Event Type': event.event_type.replace(/_/g, ' '),
            'Date & Time': formatDate(event.created_at),
            'User Name': event.updated_user.name,
            'User Email': event.updated_user.email,
            'Source Type': event.source_type,
            'Event ID': event.id
          };

          // Add note details based on event type
          if (event.note) {
            if (event.event_type === 'reminder_set' || event.event_type === 'reminder_completed') {
              row['Reminder Message'] = event.note.message || '';
              row['Reminder Date'] = event.note.date_and_time ? formatDate(event.note.date_and_time) : '';
              row['Reminder Status'] = event.note.status || '';
            } else {
              // Handle other note types
              const noteFields = Object.keys(event.note);
              noteFields.forEach(field => {
                row[`Note - ${field.replace(/_/g, ' ')}`] = event.note[field];
              });
            }
          }

          exportData.push(row);
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
    
    // Auto-size columns
    const colWidths = [];
    const headers = Object.keys(exportData[0] || {});
    headers.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...exportData.map(row => String(row[header] || '').length)
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    ws['!cols'] = colWidths;

    const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').replace(/\..+/, '');
  XLSX.writeFile(wb, `Assignment_Timeline_${id}_${timestamp}.xlsx`);

  };

  const exportToWord = async () => {
    try {
      // Calculate stats
      const totalEvents = timeline.reduce((acc, assignment) => 
        acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
          statusAcc + status.events.length, 0), 0);

      const totalNotes = timeline.reduce((acc, assignment) => 
        acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
          statusAcc + status.events.filter(e => e.event_type === 'note_added').length, 0), 0);

      const totalFollowUps = timeline.reduce((acc, assignment) => 
        acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
          statusAcc + status.events.filter(e => 
            e.event_type === 'follow_up' || 
            e.event_type === 'reminder_set' || 
            e.event_type === 'reminder_completed'
          ).length, 0), 0);

      const totalStatusChanges = timeline.reduce((acc, assignment) => 
        acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
          statusAcc + status.events.filter(e => e.event_type === 'status_changed').length, 0), 0);

      // Create document sections
      const docSections = [];

      // Header section
      docSections.push(
        new Paragraph({
          text: "Assignment Timeline Report",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Assignment ID: ${id}`,
              bold: true,
            })
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
              italics: true,
            })
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }), // Empty line
      );

      // Statistics table
      const statsTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "Metric", bold: true })] 
                })],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "Count", bold: true })] 
                })],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Total Events")] }),
              new TableCell({ children: [new Paragraph(totalEvents.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Notes Added")] }),
              new TableCell({ children: [new Paragraph(totalNotes.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Follow-ups")] }),
              new TableCell({ children: [new Paragraph(totalFollowUps.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Status Changes")] }),
              new TableCell({ children: [new Paragraph(totalStatusChanges.toString())] }),
            ],
          }),
        ],
      });

      docSections.push(
        new Paragraph({
          text: "Summary Statistics",
          heading: HeadingLevel.HEADING_1,
        }),
        statsTable,
        new Paragraph({ text: "" }), // Empty line
      );

      // Timeline content
      processedTimeline.forEach(assignment => {
        assignment.timeline_by_status.forEach(statusGroup => {
          // Status header
          docSections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${formatStatusName(statusGroup.assignment_status)} (${statusGroup.events.length} events)`,
                  bold: true,
                  size: 32, // 16pt
                })
              ],
              heading: HeadingLevel.HEADING_2,
            })
          );

          // Events for this status
          statusGroup.events.forEach((event, index) => {
            // Event header
            docSections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${event.event_type.replace(/_/g, ' ').toUpperCase()}`,
                    bold: true,
                  })
                ],
              })
            );

            // Event details
            docSections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "Date & Time: ", bold: true }),
                  new TextRun({ text: formatDate(event.created_at) })
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "User: ", bold: true }),
                  new TextRun({ text: `${event.updated_user.name} (${event.updated_user.email})` })
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Source: ", bold: true }),
                  new TextRun({ text: event.source_type })
                ],
              })
            );

            // Note content for reminders
            if ((event.event_type === 'reminder_set' || event.event_type === 'reminder_completed') && event.note) {
              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: event.event_type === 'reminder_set' ? "🔔 Reminder Details:" : "✅ Completed Reminder Details:",
                      bold: true,
                    })
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Message: ", bold: true }),
                    new TextRun({ text: event.note.message || '' })
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Scheduled for: ", bold: true }),
                    new TextRun({ text: event.note.date_and_time ? formatDate(event.note.date_and_time) : '' })
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Status: ", bold: true }),
                    new TextRun({ text: event.note.status || '' })
                  ],
                })
              );
            }

            // Other note types
            if (event.note && event.event_type !== 'reminder_set' && event.event_type !== 'reminder_completed') {
              docSections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: "Note Details:", bold: true })
                  ],
                })
              );

              Object.entries(event.note).forEach(([key, value]) => {
                docSections.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${key.replace(/_/g, ' ')}: `, bold: true }),
                      new TextRun({ text: String(value) })
                    ],
                  })
                );
              });
            }

            // Event ID
            docSections.push(
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `Event ID: ${event.id}`,
                    italics: true,
                    size: 20, // 10pt
                  })
                ],
              }),
              new Paragraph({ text: "" }) // Empty line between events
            );
          });

          docSections.push(new Paragraph({ text: "" })); // Empty line between statuses
        });
      });

      // Create the document
      const doc = new Document({
        sections: [{
          properties: {},
          children: docSections,
        }],
      });

      // Generate and download the document
      // ✅ Use toBlob instead of toBuffer in browser
      const blob = await Packer.toBlob(doc);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').replace(/\..+/, '');
      link.download = `Assignment_Timeline_${id}_${timestamp}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('Failed to export to Word. Please try again.');
    }
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Assignment Timeline - ${id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2F4C92; padding-bottom: 20px; }
          .header h1 { color: #2F4C92; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
          .stat-number { font-size: 24px; font-weight: bold; color: #2F4C92; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .status-section { margin-bottom: 30px; page-break-inside: avoid; }
          .status-header { background: #2F4C92; color: white; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .event { margin-bottom: 20px; border-left: 4px solid #e9ecef; padding-left: 15px; page-break-inside: avoid; }
          .event-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
          .event-type { background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .event-date { color: #666; font-size: 12px; }
          .event-user { font-size: 14px; margin-bottom: 10px; color: #555; }
          .event-content { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
          .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 10px 0; }
          .reminder-completed { background: #d4edda; border: 1px solid #c3e6cb; }
          @media print { 
            body { margin: 0; } 
            .status-section { page-break-before: auto; }
            .event { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Assignment Timeline Report</h1>
          <p>Assignment ID: ${id}</p>
          <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">${totalEvents}</div>
            <div class="stat-label">Total Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalNotes}</div>
            <div class="stat-label">Notes Added</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalFollowUps}</div>
            <div class="stat-label">Follow-ups</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${totalStatusChanges}</div>
            <div class="stat-label">Status Changes</div>
          </div>
        </div>

        ${processedTimeline.map(assignment => 
          assignment.timeline_by_status.map(statusGroup => `
            <div class="status-section">
              <div class="status-header">
                ${formatStatusName(statusGroup.assignment_status)} 
                (${statusGroup.events.length} events)
              </div>
              ${statusGroup.events.map(event => `
                <div class="event">
                  <div class="event-header">
                    <span class="event-type">${event.event_type.replace(/_/g, ' ')}</span>
                    <span class="event-date">${formatDate(event.created_at)}</span>
                  </div>
                  <div class="event-user">
                    👤 ${event.updated_user.name} (${event.updated_user.email})
                  </div>
                  ${event.note ? `
                    <div class="event-content">
                      ${(event.event_type === 'reminder_set' || event.event_type === 'reminder_completed') ? `
                        <div class="reminder-box ${event.event_type === 'reminder_completed' ? 'reminder-completed' : ''}">
                          <strong>${event.event_type === 'reminder_set' ? '🔔 Reminder Set' : '✅ Reminder Completed'}</strong><br>
                          <strong>Message:</strong> ${event.note.message || ''}<br>
                          <strong>Scheduled for:</strong> ${event.note.date_and_time ? formatDate(event.note.date_and_time) : ''}<br>
                          <strong>Status:</strong> ${event.note.status || ''}
                        </div>
                      ` : `
                        ${Object.entries(event.note).map(([key, value]) => `
                          <strong>${key.replace(/_/g, ' ')}:</strong> ${value}<br>
                        `).join('')}
                      `}
                    </div>
                  ` : ''}
                  <div style="font-size: 12px; color: #666; margin-top: 10px;">
                    Source: ${event.source_type} | ID: ${event.id}
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')
        ).join('')}
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const response = await databaseService.getAssignmentTimeline(id);
        console.log(response);

        // Handle the response structure - it's an array of assignments
        if (Array.isArray(response) && response.length > 0) {
          setTimeline(response);
        } else {
          setTimeline([]);
        }
      } catch (err) {
        console.error('Error fetching timeline:', err);
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
      'follow_up': <Bell className="w-4 h-4" />,
      'reminder_set': <Bell className="w-4 h-4" />,
      'reminder_completed': <Bell className="w-4 h-4" />
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

  const totalNotes = timeline.reduce((acc, assignment) => 
    acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
      statusAcc + status.events.filter(e => e.event_type === 'note_added').length, 0), 0);

  const totalFollowUps = timeline.reduce((acc, assignment) => 
    acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
      statusAcc + status.events.filter(e => 
        e.event_type === 'follow_up' || 
        e.event_type === 'reminder_set' || 
        e.event_type === 'reminder_completed'
      ).length, 0), 0);

  const totalStatusChanges = timeline.reduce((acc, assignment) => 
    acc + assignment.timeline_by_status.reduce((statusAcc, status) => 
      statusAcc + status.events.filter(e => e.event_type === 'status_changed').length, 0), 0);

  return (
    <div className=" mx-auto p-6">
      <div className="mb-6 pl-6 flex flex-row items-center">
        <div className=' flex-1'>
          <div className='flex flex-row items-center gap-4'>
          <FaArrowLeft className="text-[#2F4C92] text-3xl cursor-pointer" onClick={() => {navigate(-1)}}/>
          <h1 className="text-2xl font-bold text-[#2F4C92]">Assignment Timeline</h1>
        </div>
        <p className="text-gray-500 mt-1">Track progress, follow up reminders and status changes </p>
        </div>
        
        {/* Export buttons */}
        <div className="flex gap-3 mt-4">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
          <button 
            onClick={exportToWord}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Word
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to PDF
          </button>
        </div>
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
          <p className="text-2xl font-bold text-green-600 mt-1">{totalNotes}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-900">Follow-ups</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{totalFollowUps}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Status Changes</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalStatusChanges}</p>
        </div>
      </div>

      <div className="space-y-8">
        {processedTimeline.map((assignment) => (
          <div key={assignment.assignment_id} className="space-y-6">
            {assignment.timeline_by_status.map((statusGroup, statusIndex) => (
              <div key={`${assignment.assignment_id}-${statusGroup.assignment_status}-${statusIndex}`} className="relative">
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
                          event.event_type === 'follow_up' ? 'bg-yellow-500' :
                          event.event_type === 'reminder_set' ? 'bg-yellow-500' :
                          event.event_type === 'reminder_completed' ? 'bg-green-500' : 'bg-gray-500'
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
                                  event.event_type === 'follow_up' ? 'bg-yellow-100 text-yellow-800' :
                                  event.event_type === 'reminder_set' ? 'bg-yellow-100 text-yellow-800' :
                                  event.event_type === 'reminder_completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {event.event_type.replace(/_/g, ' ')}
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

                            {/* Reminder details for reminder events */}
                            {(event.event_type === 'reminder_set' || event.event_type === 'reminder_completed') && event.note && (
                              <div className={`mb-3 p-3 rounded-lg border-l-4 ${
                                event.event_type === 'reminder_set' ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-medium ${
                                    event.event_type === 'reminder_set' ? 'text-yellow-800' : 'text-green-800'
                                  }`}>
                                    {event.event_type === 'reminder_set' ? '🔔 Reminder Set' : '✅ Reminder Completed'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    event.note.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {event.note.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Message:</strong> {event.note.message}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <strong>Scheduled for:</strong> {formatDate(event.note.date_and_time)}
                                </p>
                              </div>
                            )}

                            {/* Notes content */}
                            {event.note && (event.event_type !== 'reminder_set' && event.event_type !== 'reminder_completed') && renderNoteContent(event.note)}

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