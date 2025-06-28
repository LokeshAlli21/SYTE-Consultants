import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';

function ExportAssignmentsButton({ data = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
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

    // Load external scripts dynamically
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    // Generate PDF using jsPDF
    const exportToPDF = async () => {
        setIsGenerating(true);
        try {
            // Load jsPDF
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const formattedData = formatDataForDisplay(data);
            
            // PDF Settings
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            let yPosition = margin;
            
            // Title
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text('📋 Assignments Report', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            
            // Date
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            doc.text(`Total Assignments: ${formattedData.length}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 20;
            
            // Process each assignment
            formattedData.forEach((assignment, index) => {
                // Check if we need a new page
                if (yPosition > pageHeight - 50) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                // Assignment header
                doc.setFillColor(76, 175, 80);
                doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(`Assignment #${assignment['Assignment No.']} - ${assignment['Project Name']}`, margin + 5, yPosition + 5);
                yPosition += 20;
                
                // Reset text color
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                
                // Assignment details
                Object.entries(assignment).forEach(([key, value]) => {
                    if (key !== 'Assignment No.' && key !== 'Project Name') {
                        // Check if we need a new page
                        if (yPosition > pageHeight - 30) {
                            doc.addPage();
                            yPosition = margin;
                        }
                        
                        doc.setFont(undefined, 'bold');
                        doc.text(`${key}:`, margin, yPosition);
                        doc.setFont(undefined, 'normal');
                        
                        // Handle long text
                        const textLines = doc.splitTextToSize(value.toString(), pageWidth - margin - 60);
                        doc.text(textLines, margin + 60, yPosition);
                        yPosition += textLines.length * 5;
                    }
                });
                
                yPosition += 10; // Space between assignments
            });
            
            // Save the PDF
            doc.save(`Assignments_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGenerating(false);
            setIsOpen(false);
        }
    };

    // Generate Excel using SheetJS
    const exportToExcel = async () => {
        setIsGenerating(true);
        try {
            // Load SheetJS
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
            
            const XLSX = window.XLSX;
            const formattedData = formatDataForDisplay(data);
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            
            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(formattedData);
            
            // Set column widths
            const colWidths = [];
            Object.keys(formattedData[0] || {}).forEach((key, index) => {
                colWidths[index] = { wch: Math.max(key.length, 20) };
            });
            ws['!cols'] = colWidths;
            
            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Assignments');
            
            // Generate Excel file
            XLSX.writeFile(wb, `Assignments_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            
        } catch (error) {
            console.error('Error generating Excel:', error);
            alert('Error generating Excel file. Please try again.');
        } finally {
            setIsGenerating(false);
            setIsOpen(false);
        }
    };

    // Generate Word document
    const exportToWord = async () => {
        setIsGenerating(true);
        try {
            const formattedData = formatDataForDisplay(data);
            
            // Create Word document content
            let docContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                      xmlns:w="urn:schemas-microsoft-com:office:word" 
                      xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="utf-8">
                    <title>Assignments Report</title>
                    <!--[if gte mso 9]>
                    <xml>
                        <w:WordDocument>
                            <w:View>Print</w:View>
                            <w:Zoom>90</w:Zoom>
                            <w:DoNotPromptForConvert/>
                            <w:DoNotShowInsertionsAndDeletions/>
                        </w:WordDocument>
                    </xml>
                    <![endif]-->
                    <style>
                        @page { margin: 1in; }
                        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .assignment { margin-bottom: 30px; border: 1px solid #ccc; page-break-inside: avoid; }
                        .assignment-title { background-color: #4CAF50; color: white; padding: 10px; font-weight: bold; }
                        .field { margin-bottom: 8px; }
                        .label { font-weight: bold; display: inline-block; width: 150px; vertical-align: top; }
                        .value { display: inline-block; width: calc(100% - 160px); }
                        .fees-section { background-color: #f0f8f0; padding: 10px; margin: 10px 0; }
                        .section-title { font-weight: bold; color: #2E7D32; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>📋 Assignments Report</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        <p>Total Assignments: ${formattedData.length}</p>
                    </div>
            `;

            formattedData.forEach((assignment) => {
                docContent += `
                    <div class="assignment">
                        <div class="assignment-title">
                            Assignment #${assignment['Assignment No.']} - ${assignment['Project Name']}
                        </div>
                        <div style="padding: 15px;">
                `;
                
                // Basic information
                const basicFields = ['Assignment Type', 'Application Number', 'Payment Date', 'Login ID', 'Password', 'Remarks', 'Created Date', 'Updated Date'];
                basicFields.forEach(field => {
                    if (assignment[field]) {
                        docContent += `
                            <div class="field">
                                <span class="label">${field}:</span>
                                <span class="value">${assignment[field]}</span>
                            </div>
                        `;
                    }
                });
                
                // Fees section
                docContent += `
                    <div class="fees-section">
                        <div class="section-title">💰 Fee Structure</div>
                `;
                const feeFields = ['Consultation Charges', 'Government Fees', 'CA Fees', 'Engineer Fees', 'Architect Fees', 'Liasioning Fees'];
                feeFields.forEach(field => {
                    if (assignment[field]) {
                        docContent += `
                            <div class="field">
                                <span class="label">${field}:</span>
                                <span class="value">${assignment[field]}</span>
                            </div>
                        `;
                    }
                });
                docContent += `</div>`;
                
                // Notes section
                const noteFields = Object.keys(assignment).filter(key => key.startsWith('Note -'));
                if (noteFields.length > 0) {
                    docContent += `
                        <div class="section-title">📝 Notes</div>
                    `;
                    noteFields.forEach(noteField => {
                        docContent += `
                            <div class="field">
                                <span class="label">${noteField.replace('Note - ', '')}:</span>
                                <span class="value">${assignment[noteField]}</span>
                            </div>
                        `;
                    });
                }
                
                // Reminders section
                const reminderFields = Object.keys(assignment).filter(key => key.startsWith('Reminder '));
                if (reminderFields.length > 0) {
                    docContent += `
                        <div class="section-title">⏰ Reminders</div>
                    `;
                    reminderFields.forEach(reminderField => {
                        docContent += `
                            <div class="field">
                                <span class="label">${reminderField}:</span>
                                <span class="value">${assignment[reminderField]}</span>
                            </div>
                        `;
                    });
                }
                
                docContent += `</div></div>`;
            });

            docContent += `</body></html>`;

            // Create blob and download
            const blob = new Blob([docContent], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Assignments_Report_${new Date().toISOString().split('T')[0]}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error generating Word document:', error);
            alert('Error generating Word document. Please try again.');
        } finally {
            setIsGenerating(false);
            setIsOpen(false);
        }
    };

    const exportOptions = [
        {
            label: 'Download as PDF',
            icon: <FileText className="w-4 h-4" />,
            action: exportToPDF,
            description: 'Professional PDF document',
            color: 'text-red-600 bg-red-100'
        },
        {
            label: 'Download as Excel',
            icon: <FileSpreadsheet className="w-4 h-4" />,
            action: exportToExcel,
            description: 'Excel spreadsheet (.xlsx)',
            color: 'text-green-600 bg-green-100'
        },
        {
            label: 'Download as Word',
            icon: <File className="w-4 h-4" />,
            action: exportToWord,
            description: 'Word document (.docx)',
            color: 'text-blue-600 bg-blue-100'
        }
    ];

    // Demo data for testing
    const demoData = [
        {
            project_name: "Sample Project 1",
            assignment_type: "Consultation",
            application_number: "APP001",
            payment_date: "2024-01-15",
            login_id: "user001",
            password: "pass123",
            consultation_charges: 5000,
            govt_fees: 2000,
            ca_fees: 3000,
            engineer_fees: 4000,
            arch_fees: 2500,
            liasioning_fees: 1500,
            remarks: "Initial consultation completed",
            created_at: "2024-01-10",
            updated_at: "2024-01-16",
            timeline: {
                note: {
                    initial_review: "Project requirements analyzed",
                    follow_up: "Client meeting scheduled"
                }
            },
            reminders: [
                {
                    message: "Follow up with client",
                    date_and_time: "2024-02-01T10:00:00",
                    status: "pending"
                }
            ]
        },
        {
            project_name: "Sample Project 2",
            assignment_type: "Implementation",
            application_number: "APP002",
            payment_date: "2024-01-20",
            login_id: "user002",
            password: "pass456",
            consultation_charges: 7500,
            govt_fees: 3000,
            ca_fees: 4500,
            engineer_fees: 6000,
            arch_fees: 3500,
            liasioning_fees: 2000,
            remarks: "Implementation in progress",
            created_at: "2024-01-15",
            updated_at: "2024-01-21"
        }
    ];

    // Use demo data if no data provided
    const displayData = data.length > 0 ? data : demoData;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-medium ${
                    isGenerating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
                <Download className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Download Report'}
                <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && !isGenerating && (
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
                                className="w-full text-left px-4 py-4 hover:bg-gray-50 rounded-lg flex items-center gap-4 transition-colors duration-150 border-b border-gray-50 last:border-b-0"
                            >
                                <div className={`p-2 rounded-lg ${option.color}`}>
                                    {option.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 text-base">{option.label}</div>
                                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
                        <div className="text-xs text-gray-600 text-center">
                            {displayData.length} assignment{displayData.length !== 1 ? 's' : ''} ready for download
                            {data.length === 0 && (
                                <div className="text-blue-600 mt-1">(Using demo data for testing)</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportAssignmentsButton;