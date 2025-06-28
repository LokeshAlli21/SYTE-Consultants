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

    // Prepare data for export (excluding timeline, including note)
    const prepareDataForExport = () => {
        return data.map(item => {
            const { timeline, ...itemWithoutTimeline } = item;
            
            // Flatten note object if it exists
            if (item.note && typeof item.note === 'object') {
                const noteEntries = Object.entries(item.note).map(([key, value]) => `${key}: ${value}`).join('; ');
                return { ...itemWithoutTimeline, note: noteEntries };
            }
            
            return itemWithoutTimeline;
        });
    };

    const exportToCSV = () => {
        const exportData = prepareDataForExport();
        if (exportData.length === 0) return;

        const headers = Object.keys(exportData[0]).filter(key => key !== 'reminders');
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => {
                    let value = row[header];
                    if (header === 'reminders' && Array.isArray(value)) {
                        value = value.map(r => `${r.message} (${r.date_and_time})`).join('; ');
                    }
                    return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `assignments_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setIsOpen(false);
    };

    const exportToJSON = () => {
        const exportData = prepareDataForExport();
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `assignments_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        setIsOpen(false);
    };

    const exportToTXT = () => {
        const exportData = prepareDataForExport();
        let txtContent = 'ASSIGNMENTS EXPORT REPORT\n';
        txtContent += '=' .repeat(50) + '\n\n';
        
        exportData.forEach((assignment, index) => {
            txtContent += `Assignment ${index + 1}:\n`;
            txtContent += '-'.repeat(20) + '\n';
            Object.entries(assignment).forEach(([key, value]) => {
                if (key === 'reminders' && Array.isArray(value)) {
                    txtContent += `${key}: ${value.map(r => `${r.message} (${r.date_and_time})`).join('; ')}\n`;
                } else {
                    txtContent += `${key}: ${value}\n`;
                }
            });
            txtContent += '\n';
        });

        const blob = new Blob([txtContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `assignments_export_${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        setIsOpen(false);
    };

    const exportToPDF = () => {
        // For PDF export, we'll create a printable HTML version
        const exportData = prepareDataForExport();
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Assignments Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .assignment { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
                    .assignment-header { background-color: #f5f5f5; padding: 10px; margin: -15px -15px 15px -15px; }
                    .field { margin-bottom: 8px; }
                    .field-label { font-weight: bold; display: inline-block; width: 200px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <h1>Assignments Export Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
        `;

        exportData.forEach((assignment, index) => {
            htmlContent += `
                <div class="assignment">
                    <div class="assignment-header">
                        <h3>Assignment ${index + 1}</h3>
                    </div>
            `;
            
            Object.entries(assignment).forEach(([key, value]) => {
                if (key === 'reminders' && Array.isArray(value)) {
                    htmlContent += `
                        <div class="field">
                            <span class="field-label">${key}:</span>
                            ${value.map(r => `${r.message} (${r.date_and_time})`).join('; ')}
                        </div>
                    `;
                } else {
                    htmlContent += `
                        <div class="field">
                            <span class="field-label">${key}:</span>
                            ${value || 'N/A'}
                        </div>
                    `;
                }
            });
            
            htmlContent += '</div>';
        });

        htmlContent += `
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()">Print this document</button>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `assignments_export_${new Date().toISOString().split('T')[0]}.html`;
        link.click();
        setIsOpen(false);
    };

    const exportOptions = [
        {
            label: 'Export as PDF',
            icon: <FileText className="w-4 h-4" />,
            action: exportToPDF,
            description: 'Printable PDF format'
        },
        {
            label: 'Export as Excel',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            action: exportToCSV,
            description: 'CSV format for Excel'
        },
        {
            label: 'Export as JSON',
            icon: <File className="w-4 h-4" />,
            action: exportToJSON,
            description: 'JSON data format'
        },
        {
            label: 'Export as Text',
            icon: <FileText className="w-4 h-4" />,
            action: exportToTXT,
            description: 'Plain text format'
        }
    ];

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
            >
                <Download className="w-4 h-4" />
                Export
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
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-2">
                        {exportOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.action}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors duration-150"
                            >
                                <div className="text-gray-600">
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{option.label}</div>
                                    <div className="text-sm text-gray-500">{option.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {data.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-100">
                            No data available to export
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExportAssignmentsButton