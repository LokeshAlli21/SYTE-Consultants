import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Printer, FileCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

function ExportAssignmentsButton({ data }) {
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Filter and clean data for export (remove sensitive info)
    const cleanDataForExport = () => {
        return data?.map(item => ({
            id: item.id,
            project_name: item.project_name,
            assignment_type: item.assignment_type,
            application_number: item.application_number,
            payment_date: new Date(item.payment_date).toLocaleDateString(),
            login_id: item.login_id,
            remarks: item.remarks,
            assignment_status: item.timeline?.assignment_status || 'N/A',
            note: item.timeline?.note ? JSON.stringify(item.timeline.note) : 'No notes',
            reminders: item.reminders?.length || 0,
            created_date: new Date(item.created_at).toLocaleDateString(),
        })) || [];
    };

    // Export to CSV
    const exportToCSV = () => {
        const cleanData = cleanDataForExport();
        if (!cleanData.length) return;

        const headers = Object.keys(cleanData[0]);
        const csvContent = [
            headers.join(','),
            ...cleanData.map(row => 
                headers.map(header => 
                    typeof row[header] === 'string' && row[header].includes(',') 
                        ? `"${row[header]}"` 
                        : row[header]
                ).join(',')
            )
        ].join('\n');

        downloadFile(csvContent, 'assignments.csv', 'text/csv');
    };

    // Export to JSON
    const exportToJSON = () => {
        const cleanData = cleanDataForExport();
        const jsonContent = JSON.stringify(cleanData, null, 2);
        downloadFile(jsonContent, 'assignments.json', 'application/json');
    };

    // Export to Excel (.xlsx)
    const exportToExcel = () => {
        const cleanData = cleanDataForExport();
        if (!cleanData.length) return;

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert data to worksheet
        const ws = XLSX.utils.json_to_sheet(cleanData);
        
        // Set column widths for better readability
        const colWidths = [
            { wch: 15 }, // project_name
            { wch: 15 }, // assignment_type
            { wch: 20 }, // application_number
            { wch: 12 }, // payment_date
            { wch: 12 }, // login_id
            { wch: 25 }, // remarks
            { wch: 15 }, // assignment_status
            { wch: 30 }, // note
            { wch: 10 }, // reminders
            { wch: 12 }, // created_date
        ];
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Assignments');
        
        // Save the file
        XLSX.writeFile(wb, 'assignments.xlsx');
        setShowDropdown(false);
    };

    // Export to Word (.docx)
    const exportToWord = () => {
        const cleanData = cleanDataForExport();
        if (!cleanData.length) return;

        // Create HTML content for Word document
        const htmlContent = `
            <!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
                <meta charset='utf-8'>
                <title>Assignments Report</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 40px; 
                        line-height: 1.6;
                    }
                    h1 { 
                        color: #333; 
                        text-align: center; 
                        border-bottom: 2px solid #4CAF50;
                        padding-bottom: 10px;
                        margin-bottom: 30px;
                    }
                    .header-info { 
                        margin-bottom: 30px; 
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 5px;
                    }
                    .assignment-item {
                        margin-bottom: 25px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        page-break-inside: avoid;
                    }
                    .assignment-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 5px;
                    }
                    .field-row {
                        margin: 8px 0;
                        display: flex;
                    }
                    .field-label {
                        font-weight: bold;
                        width: 180px;
                        color: #555;
                    }
                    .field-value {
                        flex: 1;
                        color: #333;
                    }
                    .notes-section {
                        background-color: #f8f9fa;
                        padding: 10px;
                        border-radius: 3px;
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <h1>Assignments Report</h1>
                
                <div class="header-info">
                    <div class="field-row">
                        <span class="field-label">Generated on:</span>
                        <span class="field-value">${new Date().toLocaleString()}</span>
                    </div>
                    <div class="field-row">
                        <span class="field-label">Total Records:</span>
                        <span class="field-value">${cleanData.length}</span>
                    </div>
                </div>

                ${cleanData.map((item, index) => `
                    <div class="assignment-item">
                        <div class="assignment-title">Assignment #${index + 1}: ${item.project_name}</div>
                        
                        <div class="field-row">
                            <span class="field-label">Assignment Type:</span>
                            <span class="field-value">${item.assignment_type}</span>
                        </div>
                        
                        <div class="field-row">
                            <span class="field-label">Application Number:</span>
                            <span class="field-value">${item.application_number}</span>
                        </div>
                        
                        <div class="field-row">
                            <span class="field-label">Payment Date:</span>
                            <span class="field-value">${item.payment_date}</span>
                        </div>
                        
                        <div class="field-row">
                            <span class="field-label">Login ID:</span>
                            <span class="field-value">${item.login_id}</span>
                        </div>
                        
                        <div class="field-row">
                            <span class="field-label">Status:</span>
                            <span class="field-value">${item.assignment_status}</span>
                        </div>
                        
                        <div class="field-row">
                            <span class="field-label">Created Date:</span>
                            <span class="field-value">${item.created_date}</span>
                        </div>
                        
                        <div class="field-row">
                            <span class="field-label">Active Reminders:</span>
                            <span class="field-value">${item.reminders}</span>
                        </div>
                        
                        ${item.remarks ? `
                        <div class="field-row">
                            <span class="field-label">Remarks:</span>
                            <span class="field-value">${item.remarks}</span>
                        </div>
                        ` : ''}
                        
                        ${item.note && item.note !== 'No notes' ? `
                        <div class="notes-section">
                            <div style="font-weight: bold; margin-bottom: 5px;">Notes:</div>
                            <div>${item.note}</div>
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
                
                <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                    <hr style="margin: 20px 0;">
                    Report generated from Assignment Management System
                </div>
            </body>
            </html>
        `;

        // Create blob and download
        const blob = new Blob([htmlContent], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'assignments-report.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowDropdown(false);
    };

    // Create printable HTML
    const exportToPrint = () => {
        const cleanData = cleanDataForExport();
        if (!cleanData.length) return;

        const printWindow = window.open('', '_blank');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Assignments Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .header-info { margin-bottom: 20px; }
                    @media print { 
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header-info">
                    <h1>Assignments Report</h1>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Total Records:</strong> ${cleanData.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Assignment Type</th>
                            <th>Application Number</th>
                            <th>Payment Date</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cleanData.map(item => `
                            <tr>
                                <td>${item.project_name}</td>
                                <td>${item.assignment_type}</td>
                                <td>${item.application_number}</td>
                                <td>${item.payment_date}</td>
                                <td>${item.assignment_status}</td>
                                <td>${item.remarks}</td>
                                <td>${item.created_date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    // Helper function to download files
    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowDropdown(false);
    };

    const exportOptions = [
        {
            label: 'Download Excel File',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            action: exportToExcel,
            description: 'Real Excel (.xlsx) file'
        },
        {
            label: 'Download Word Document',
            icon: <FileCheck className="w-4 h-4" />,
            action: exportToWord,
            description: 'Formatted Word (.docx) report'
        },
        {
            label: 'Export as CSV',
            icon: <FileText className="w-4 h-4" />,
            action: exportToCSV,
            description: 'Comma-separated values'
        },
        {
            label: 'Export as JSON',
            icon: <File className="w-4 h-4" />,
            action: exportToJSON,
            description: 'Raw data format'
        },
        {
            label: 'Print Report',
            icon: <Printer className="w-4 h-4" />,
            action: exportToPrint,
            description: 'Printable report'
        }
    ];

    return (
        <div className="relative">
            <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <Download className="w-4 h-4" />
                Export Assignments
            </button>

            {showDropdown && (
                <div 
                    className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                            Choose export format:
                        </div>
                        {exportOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.action}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left"
                            >
                                <div className="text-blue-600 mt-0.5">
                                    {option.icon}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 text-sm">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {option.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                        {data?.length || 0} records ready for export
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExportAssignmentsButton;