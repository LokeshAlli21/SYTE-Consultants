import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Printer } from 'lucide-react';

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

    // Export to TSV (Tab-separated values - can be opened in Excel)
    const exportToTSV = () => {
        const cleanData = cleanDataForExport();
        if (!cleanData.length) return;

        const headers = Object.keys(cleanData[0]);
        const tsvContent = [
            headers.join('\t'),
            ...cleanData.map(row => 
                headers.map(header => row[header]).join('\t')
            )
        ].join('\n');

        downloadFile(tsvContent, 'assignments.tsv', 'text/tab-separated-values');
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
            label: 'Export as Excel (TSV)',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            action: exportToTSV,
            description: 'Opens in Excel/Sheets'
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