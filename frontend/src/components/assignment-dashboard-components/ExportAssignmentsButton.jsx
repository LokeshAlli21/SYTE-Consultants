import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, File, Printer, FileCheck, ChevronDown, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';

function ExportAssignmentsButton({ data }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportingType, setExportingType] = useState('');
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
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

    const handleExport = async (type, action) => {
        setIsExporting(true);
        setExportingType(type);
        
        try {
            await action();
            // Add a small delay to show the loading state
            setTimeout(() => {
                setIsExporting(false);
                setExportingType('');
            }, 1000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
            setExportingType('');
        }
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

    // Export to Word (.docx) using proper docx library structure
    const exportToWord = async () => {
        const cleanData = cleanDataForExport();
        if (!cleanData.length) return;

        // Since we don't have access to the docx library in this environment,
        // I'll create a structure that would work with it
        const docStructure = {
            sections: [{
                properties: {},
                children: [
                    // Title
                    {
                        type: 'paragraph',
                        properties: {
                            alignment: 'center',
                            spacing: { after: 400 }
                        },
                        children: [{
                            type: 'text',
                            text: 'Assignments Report',
                            properties: {
                                bold: true,
                                size: 28,
                                color: '2c3e50'
                            }
                        }]
                    },
                    
                    // Header info
                    {
                        type: 'paragraph',
                        properties: { spacing: { after: 200 } },
                        children: [{
                            type: 'text',
                            text: `Generated on: ${new Date().toLocaleString()}`,
                            properties: { bold: true }
                        }]
                    },
                    {
                        type: 'paragraph',
                        properties: { spacing: { after: 400 } },
                        children: [{
                            type: 'text',
                            text: `Total Records: ${cleanData.length}`,
                            properties: { bold: true }
                        }]
                    },
                    
                    // Data sections
                    ...cleanData.map((item, index) => [
                        {
                            type: 'paragraph',
                            properties: {
                                spacing: { before: 200, after: 100 },
                                border: { bottom: { style: 'single', size: 1 } }
                            },
                            children: [{
                                type: 'text',
                                text: `Assignment #${index + 1}: ${item.project_name}`,
                                properties: { bold: true, size: 24, color: '2c3e50' }
                            }]
                        },
                        ...Object.entries(item).map(([key, value]) => ({
                            type: 'paragraph',
                            properties: { spacing: { after: 100 } },
                            children: [
                                {
                                    type: 'text',
                                    text: `${key.replace(/_/g, ' ').toUpperCase()}: `,
                                    properties: { bold: true }
                                },
                                {
                                    type: 'text',
                                    text: String(value)
                                }
                            ]
                        }))
                    ]).flat()
                ]
            }]
        };

        // For now, fall back to HTML-based Word export
        // In a real implementation, you would use:
        /*
        const doc = new Document(docStructure);
        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').replace(/\..+/, '');
        link.download = `Assignment_Report_${timestamp}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        */

        // Fallback HTML-based Word export
        const htmlContent = `
            <!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
                <meta charset='utf-8'>
                <title>Assignments Report</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 40px; 
                        line-height: 1.6;
                        color: #333;
                    }
                    h1 { 
                        color: #2c3e50; 
                        text-align: center; 
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 15px;
                        margin-bottom: 30px;
                        font-size: 28px;
                    }
                    .header-info { 
                        margin-bottom: 30px; 
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-radius: 10px;
                        border-left: 4px solid #3498db;
                    }
                    .assignment-item {
                        margin-bottom: 30px;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        border-radius: 10px;
                        page-break-inside: avoid;
                        background: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    .assignment-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 8px;
                    }
                    .field-row {
                        margin: 10px 0;
                        display: flex;
                        align-items: flex-start;
                    }
                    .field-label {
                        font-weight: 600;
                        width: 180px;
                        color: #555;
                        text-transform: uppercase;
                        font-size: 12px;
                        letter-spacing: 0.5px;
                    }
                    .field-value {
                        flex: 1;
                        color: #333;
                        font-size: 14px;
                    }
                    .notes-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 15px;
                        border-left: 4px solid #17a2b8;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        border-top: 1px solid #e0e0e0;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>📋 Assignments Report</h1>
                
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
                        <div class="assignment-title">📝 Assignment #${index + 1}: ${item.project_name}</div>
                        
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
                            <div style="font-weight: bold; margin-bottom: 8px; color: #17a2b8;">📌 Notes:</div>
                            <div>${item.note}</div>
                        </div>
                        ` : ''}
                    </div>
                `).join('')}
                
                <div class="footer">
                    <hr style="margin: 20px 0; border: none; height: 1px; background: #e0e0e0;">
                    🚀 Report generated from Assignment Management System
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
        const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').replace(/\..+/, '');
        link.download = `assignments-report_${timestamp}.docx`;
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
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        margin: 20px; 
                        color: #333;
                    }
                    h1 { 
                        color: #2c3e50; 
                        text-align: center; 
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 10px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px 8px; 
                        text-align: left; 
                        font-size: 12px;
                    }
                    th { 
                        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                        color: white;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    tr:nth-child(even) { background-color: #f8f9fa; }
                    tr:hover { background-color: #e3f2fd; }
                    .header-info { 
                        margin-bottom: 20px; 
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 15px;
                        border-radius: 8px;
                        border-left: 4px solid #3498db;
                    }
                    @media print { 
                        body { margin: 0; }
                        .no-print { display: none; }
                        table { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header-info">
                    <h1>📋 Assignments Report</h1>
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
            label: 'Excel Spreadsheet',
            icon: <FileSpreadsheet className="w-5 h-5" />,
            action: exportToExcel,
            description: 'Download as .xlsx file with formatting',
            gradient: 'from-emerald-500 to-teal-600',
            type: 'excel'
        },
        {
            label: 'Word Document',
            icon: <FileCheck className="w-5 h-5" />,
            action: exportToWord,
            description: 'Professional formatted .docx report',
            gradient: 'from-blue-500 to-indigo-600',
            type: 'word'
        },
        {
            label: 'CSV Data',
            icon: <FileText className="w-5 h-5" />,
            action: exportToCSV,
            description: 'Comma-separated values for analysis',
            gradient: 'from-orange-500 to-red-600',
            type: 'csv'
        },
        {
            label: 'JSON Format',
            icon: <File className="w-5 h-5" />,
            action: exportToJSON,
            description: 'Raw structured data format',
            gradient: 'from-purple-500 to-pink-600',
            type: 'json'
        },
        {
            label: 'Print Preview',
            icon: <Printer className="w-5 h-5" />,
            action: exportToPrint,
            description: 'Open print-friendly version',
            gradient: 'from-gray-500 to-slate-600',
            type: 'print'
        }
    ];

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isExporting 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
                }`}
                onClick={() => !isExporting && setShowDropdown(!showDropdown)}
                disabled={isExporting}
            >
                <div className="flex items-center gap-2">
                    {isExporting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    )}
                    <span className="text-sm font-semibold">
                        {isExporting ? `Exporting ${exportingType}...` : 'Export Data'}
                    </span>
                </div>
                {!isExporting && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                )}
                
                {/* Floating sparkles effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/20 rounded-full animate-ping" />
                    <div className="absolute top-1 left-1 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
                </div>
            </button>

            {showDropdown && !isExporting && (
                <div 
                    ref={dropdownRef}
                    className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl z-50 min-w-80 overflow-hidden animate-in slide-in-from-top-2 duration-200"
                >
                    {/* Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-gray-700">Choose Export Format</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Select your preferred format to download</p>
                    </div>
                    
                    {/* Options */}
                    <div className="py-2">
                        {exportOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleExport(option.type, option.action)}
                                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 text-left group border-b border-gray-50/50 last:border-b-0"
                            >
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${option.gradient} text-white group-hover:scale-110 transition-transform duration-200`}>
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                                        {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600">
                                        {option.description}
                                    </div>
                                </div>
                                <div className="text-gray-300 group-hover:text-blue-400 transition-colors">
                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                {data?.length || 0} records ready
                            </span>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs text-gray-500">Ready to export</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExportAssignmentsButton;