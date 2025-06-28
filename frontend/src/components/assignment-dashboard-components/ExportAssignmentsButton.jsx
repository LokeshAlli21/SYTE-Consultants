import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileImage, File } from 'lucide-react';

function ExportAssignmentsButton({ data = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format data for non-technical users
    const formatDataForDisplay = (assignments) => {
        return assignments.map((assignment, index) => {
            const formatted = {
                'Assignment No.': index + 1,
                'Project Name': assignment.project_name || 'N/A',
                'Assignment Type': assignment.assignment_type || 'N/A',
                'Application Number': assignment.application_number || 'N/A',
                'Payment Date': assignment.payment_date ? new Date(assignment.payment_date).toLocaleDateString() : 'N/A',
                'Login ID': assignment.login_id || 'N/A',
                'Password': assignment.password || 'N/A',
                'Consultation Charges': assignment.consultation_charges ? `₹${assignment.consultation_charges}` : 'N/A',
                'Government Fees': assignment.govt_fees ? `₹${assignment.govt_fees}` : 'N/A',
                'CA Fees': assignment.ca_fees ? `₹${assignment.ca_fees}` : 'N/A',
                'Engineer Fees': assignment.engineer_fees ? `₹${assignment.engineer_fees}` : 'N/A',
                'Architect Fees': assignment.arch_fees ? `₹${assignment.arch_fees}` : 'N/A',
                'Liasioning Fees': assignment.liasioning_fees ? `₹${assignment.liasioning_fees}` : 'N/A',
                'Remarks': assignment.remarks || 'N/A',
                'Created Date': assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : 'N/A',
                'Updated Date': assignment.updated_at ? new Date(assignment.updated_at).toLocaleDateString() : 'N/A'
            };

            // Add notes if they exist
            if (assignment.timeline && assignment.timeline.note) {
                Object.entries(assignment.timeline.note).forEach(([key, value]) => {
                    formatted[`Note - ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`] = value || 'N/A';
                });
            }

            // Add reminders if they exist
            if (assignment.reminders && assignment.reminders.length > 0) {
                assignment.reminders.forEach((reminder, idx) => {
                    formatted[`Reminder ${idx + 1}`] = `${reminder.message} (Due: ${new Date(reminder.date_and_time).toLocaleString()}) - Status: ${reminder.status}`;
                });
            }

            return formatted;
        });
    };

    const exportToPDF = () => {
        const formattedData = formatDataForDisplay(data);
        
        // Create HTML content for PDF
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Assignments Report</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: white;
                        color: #333;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #4CAF50;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        color: #2E7D32;
                        margin: 0;
                        font-size: 28px;
                    }
                    .header p {
                        color: #666;
                        margin: 10px 0 0 0;
                        font-size: 14px;
                    }
                    .assignment {
                        background: #f9f9f9;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        margin-bottom: 25px;
                        padding: 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        page-break-inside: avoid;
                    }
                    .assignment-header {
                        background: #4CAF50;
                        color: white;
                        padding: 15px 20px;
                        border-radius: 8px 8px 0 0;
                        margin: 0;
                    }
                    .assignment-header h2 {
                        margin: 0;
                        font-size: 20px;
                    }
                    .assignment-body {
                        padding: 20px;
                    }
                    .field-row {
                        display: flex;
                        margin-bottom: 12px;
                        align-items: flex-start;
                    }
                    .field-label {
                        font-weight: bold;
                        color: #333;
                        width: 200px;
                        flex-shrink: 0;
                    }
                    .field-value {
                        color: #555;
                        flex: 1;
                        word-wrap: break-word;
                    }
                    .fees-section {
                        background: #e8f5e8;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 15px 0;
                    }
                    .fees-title {
                        font-weight: bold;
                        color: #2E7D32;
                        margin-bottom: 10px;
                        font-size: 16px;
                    }
                    .notes-section {
                        background: #fff3cd;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 15px 0;
                        border-left: 4px solid #ffc107;
                    }
                    .reminders-section {
                        background: #d4edda;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 15px 0;
                        border-left: 4px solid #28a745;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                        font-size: 12px;
                    }
                    @media print {
                        body { margin: 0; }
                        .assignment { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📋 Assignments Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                    <p>Total Assignments: ${formattedData.length}</p>
                </div>
        `;

        formattedData.forEach((assignment) => {
            htmlContent += `
                <div class="assignment">
                    <div class="assignment-header">
                        <h2>Assignment #${assignment['Assignment No.']} - ${assignment['Project Name']}</h2>
                    </div>
                    <div class="assignment-body">
                        <div class="field-row">
                            <div class="field-label">Assignment Type:</div>
                            <div class="field-value">${assignment['Assignment Type']}</div>
                        </div>
                        <div class="field-row">
                            <div class="field-label">Application Number:</div>
                            <div class="field-value">${assignment['Application Number']}</div>
                        </div>
                        <div class="field-row">
                            <div class="field-label">Payment Date:</div>
                            <div class="field-value">${assignment['Payment Date']}</div>
                        </div>
                        <div class="field-row">
                            <div class="field-label">Login ID:</div>
                            <div class="field-value">${assignment['Login ID']}</div>
                        </div>
                        <div class="field-row">
                            <div class="field-label">Password:</div>
                            <div class="field-value">${assignment['Password']}</div>
                        </div>
                        
                        <div class="fees-section">
                            <div class="fees-title">💰 Fee Structure</div>
                            <div class="field-row">
                                <div class="field-label">Consultation Charges:</div>
                                <div class="field-value">${assignment['Consultation Charges']}</div>
                            </div>
                            <div class="field-row">
                                <div class="field-label">Government Fees:</div>
                                <div class="field-value">${assignment['Government Fees']}</div>
                            </div>
                            <div class="field-row">
                                <div class="field-label">CA Fees:</div>
                                <div class="field-value">${assignment['CA Fees']}</div>
                            </div>
                            <div class="field-row">
                                <div class="field-label">Engineer Fees:</div>
                                <div class="field-value">${assignment['Engineer Fees']}</div>
                            </div>
                            <div class="field-row">
                                <div class="field-label">Architect Fees:</div>
                                <div class="field-value">${assignment['Architect Fees']}</div>
                            </div>
                            <div class="field-row">
                                <div class="field-label">Liasioning Fees:</div>
                                <div class="field-value">${assignment['Liasioning Fees']}</div>
                            </div>
                        </div>
                        
                        <div class="field-row">
                            <div class="field-label">Remarks:</div>
                            <div class="field-value">${assignment['Remarks']}</div>
                        </div>
                        <div class="field-row">
                            <div class="field-label">Created Date:</div>
                            <div class="field-value">${assignment['Created Date']}</div>
                        </div>
                        <div class="field-row">
                            <div class="field-label">Updated Date:</div>
                            <div class="field-value">${assignment['Updated Date']}</div>
                        </div>
            `;

            // Add notes section if exists
            const noteFields = Object.keys(assignment).filter(key => key.startsWith('Note -'));
            if (noteFields.length > 0) {
                htmlContent += `<div class="notes-section"><div class="fees-title">📝 Notes</div>`;
                noteFields.forEach(noteField => {
                    htmlContent += `
                        <div class="field-row">
                            <div class="field-label">${noteField.replace('Note - ', '')}:</div>
                            <div class="field-value">${assignment[noteField]}</div>
                        </div>
                    `;
                });
                htmlContent += `</div>`;
            }

            // Add reminders section if exists
            const reminderFields = Object.keys(assignment).filter(key => key.startsWith('Reminder '));
            if (reminderFields.length > 0) {
                htmlContent += `<div class="reminders-section"><div class="fees-title">⏰ Reminders</div>`;
                reminderFields.forEach(reminderField => {
                    htmlContent += `
                        <div class="field-row">
                            <div class="field-label">${reminderField}:</div>
                            <div class="field-value">${assignment[reminderField]}</div>
                        </div>
                    `;
                });
                htmlContent += `</div>`;
            }

            htmlContent += `</div></div>`;
        });

        htmlContent += `
                <div class="footer">
                    <p>This report contains ${formattedData.length} assignment(s) | Generated automatically</p>
                </div>
            </body>
            </html>
        `;

        // Create and download the HTML file that can be saved as PDF
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Assignments_Report_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show instruction to user
        setTimeout(() => {
            alert('HTML file downloaded! To convert to PDF:\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (or Cmd+P on Mac)\n3. Select "Save as PDF" as the destination\n4. Click Save');
        }, 500);
        
        setIsOpen(false);
    };

    const exportToExcel = () => {
        const formattedData = formatDataForDisplay(data);
        if (formattedData.length === 0) return;

        // Get all unique headers from all assignments
        const allHeaders = new Set();
        formattedData.forEach(assignment => {
            Object.keys(assignment).forEach(key => allHeaders.add(key));
        });
        const headers = Array.from(allHeaders);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...formattedData.map(assignment => 
                headers.map(header => {
                    let value = assignment[header] || '';
                    // Escape commas and quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        value = `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Assignments_Export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportToWord = () => {
        const formattedData = formatDataForDisplay(data);
        
        let docContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
            <head>
                <meta charset="utf-8">
                <title>Assignments Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .assignment { margin-bottom: 30px; border: 1px solid #ccc; padding: 20px; }
                    .assignment-title { background-color: #4CAF50; color: white; padding: 10px; margin: -20px -20px 20px -20px; }
                    .field { margin-bottom: 10px; }
                    .label { font-weight: bold; display: inline-block; width: 200px; }
                    .fees-section { background-color: #f0f8f0; padding: 15px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Assignments Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    <p>Total Assignments: ${formattedData.length}</p>
                </div>
        `;

        formattedData.forEach((assignment) => {
            docContent += `
                <div class="assignment">
                    <div class="assignment-title">
                        <h2>Assignment #${assignment['Assignment No.']} - ${assignment['Project Name']}</h2>
                    </div>
            `;
            
            Object.entries(assignment).forEach(([key, value]) => {
                if (key !== 'Assignment No.' && key !== 'Project Name') {
                    docContent += `
                        <div class="field">
                            <span class="label">${key}:</span>
                            <span>${value}</span>
                        </div>
                    `;
                }
            });
            
            docContent += `</div>`;
        });

        docContent += `</body></html>`;

        const blob = new Blob([docContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Assignments_Report_${new Date().toISOString().split('T')[0]}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportOptions = [
        {
            label: 'Download as PDF',
            icon: <FileText className="w-4 h-4" />,
            action: exportToPDF,
            description: 'Professional PDF document'
        },
        {
            label: 'Download as Excel',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            action: exportToExcel,
            description: 'Open in Excel or Google Sheets'
        },
        {
            label: 'Download as Word',
            icon: <File className="w-4 h-4" />,
            action: exportToWord,
            description: 'Microsoft Word document'
        }
    ];

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
                <Download className="w-5 h-5" />
                Download Report
                <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="p-3">
                        <div className="text-sm font-medium text-gray-700 mb-3 px-2">
                            Choose download format:
                        </div>
                        {exportOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.action}
                                className="w-full text-left px-4 py-4 hover:bg-green-50 rounded-lg flex items-center gap-4 transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                            >
                                <div className="text-green-600 bg-green-100 p-2 rounded-lg">
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 text-base">{option.label}</div>
                                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {data.length === 0 && (
                        <div className="px-4 py-4 text-center text-gray-500 border-t border-gray-100">
                            <div className="text-2xl mb-2">📋</div>
                            <div className="text-sm">No assignments available to download</div>
                        </div>
                    )}
                    
                    <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
                        <div className="text-xs text-gray-600 text-center">
                            {data.length} assignment{data.length !== 1 ? 's' : ''} ready for download
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExportAssignmentsButton;