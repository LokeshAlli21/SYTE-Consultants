const PromoterTable = () => {
  const headers = [
    'Sr No.',
    'Promoter Name',
    'Contact Number',
    'Email Id',
    'District',
    'City',
    'Action',
  ];

  const data = [...Array(5)].map((_, i) => ({
    srNo: i + 1,
    name: 'John Doe',
    contact: '1234567890',
    email: 'john@example.com',
    district: 'Sample District',
    city: 'Sample City',
    action: '👁️ ✏️ 🗑️',
  }));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full table-auto text-sm text-gray-700">
        <thead className="bg-[#F9FAFB]">
          <tr className="text-left text-[#2F4C92] font-medium">
            <th className="p-3 w-12">
              <input type="checkbox" className="accent-[#5CAAAB]" />
            </th>
            {headers.map((head, index) => (
              <th key={index} className="p-3 whitespace-nowrap">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-t hover:bg-[#F0F4FF] transition-colors duration-200"
            >
              <td className="p-3">
                <input type="checkbox" className="accent-[#5CAAAB]" />
              </td>
              <td className="p-3">{row.srNo}</td>
              <td className="p-3">{row.name}</td>
              <td className="p-3">{row.contact}</td>
              <td className="p-3">{row.email}</td>
              <td className="p-3">{row.district}</td>
              <td className="p-3">{row.city}</td>
              <td className="p-3 space-x-2">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromoterTable;
