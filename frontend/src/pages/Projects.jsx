import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function Projects() {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState('');

  const generateDoc = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Project Details", bold: true, size: 28 }),
                new TextRun("\n"),
                new TextRun(`Project Name: ${projectName}`),
                new TextRun("\n"),
                new TextRun(`Description: ${description}`),
                new TextRun("\n"),
                new TextRun(`Tech Stack: ${techStack}`),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "ProjectDetails.docx");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Enter Project Details</h2>
      <input
        type="text"
        placeholder="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="border w-full p-2 mb-2"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border w-full p-2 mb-2"
      />
      <input
        type="text"
        placeholder="Tech Stack"
        value={techStack}
        onChange={(e) => setTechStack(e.target.value)}
        className="border w-full p-2 mb-2"
      />
      <button
        onClick={generateDoc}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate DOCX
      </button>
    </div>
  );
}

export default Projects;
