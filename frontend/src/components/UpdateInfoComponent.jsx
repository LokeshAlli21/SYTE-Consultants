import React from 'react';

const UpdateInfoComponent = ({formData}) => {

  const formatTimeAgo = (dateString) => {
    const updatedDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 6) return `${diffDays} days ago`;
    return updatedDate.toLocaleDateString('en-IN', { dateStyle: 'medium' });
  };

  const formatTime = (dateString) => {
    const updatedDate = new Date(dateString);
    return updatedDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseUpdatedFields = (updateAction) => {
    if (!updateAction) return [];
    return updateAction.split(',').map(field => field.trim()).filter(Boolean);
  };

  const formatFieldName = (field) => {
      // Remove 'id' if it's a separate word or at the end/beginning (case-insensitive)
  const cleaned = field
    .replace(/\b(id)\b/gi, '')        // remove standalone "id"
    .replace(/_?id_?/gi, '_')         // remove id surrounded by underscores
    .replace(/^_+|_+$/g, '')          // trim underscores from start/end
    .replace(/__+/g, '_');            // replace multiple underscores with one

  const spaced = cleaned.replace(/_/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  if (!formData.updated_at) return null;

  const dateLabel = formatTimeAgo(formData.updated_at);
  const timeLabel = formatTime(formData.updated_at);
  const updatedFields = parseUpdatedFields(formData.update_action);

  // console.log(formData);
  

  return (
<div className="max-w-2xl mx-auto p-0 relative group inline-block">

    {/* Tooltip that shows on hover */}
    <div className="absolute min-w-max bg-gradient-to-r from-blue-50 to-teal-50 w-full border-l-4 border-teal-500 shadow-lg
rounded-xl p-4 transition-all duration-300 hover:shadow-xl
pointer-events-none right-full mr-3 opacity-0 group-hover:opacity-100 z-50"
>
        {/* Header with clock icon and main update info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="text-gray-700 text-sm leading-relaxed">
              <span className="text-teal-600 font-semibold">Last updated:</span>{' '}
              <span className="text-orange-500 font-semibold">{dateLabel}</span>{' '}
              <span className="text-gray-600">at</span>{' '}
              <span className="text-orange-500 font-semibold">{timeLabel}</span>
              {formData.updated_by && formData.updated_user?.name && (
                <>
                  <span className="text-gray-600"> by </span>
                  <span className="font-semibold text-blue-600">{formData.updated_user.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Updated fields section */}
        {updatedFields.length > 0 && (
          <div className="border-t border-gray-200 pt-3 mt-3 max-w-3xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="text-gray-600 text-sm font-medium mb-2">Updated fields:</div>
                <div className="flex flex-wrap gap-2">
                  {updatedFields.map((field, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 transition-colors hover:bg-blue-200"
                    >
                      {formatFieldName(field)}
                    </span>
                  ))}
                </div>
                
                {updatedFields.length > 5 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {updatedFields.length} fields updated in total
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Alternative compact version */}
      <div className="bg-white border-l-4  border-emerald-500 shadow-md rounded-lg p-3 transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-700">
              <span className="font-medium text-emerald-600">Updated</span>{' '}
              <span className="text-orange-600 font-medium">{dateLabel}</span>
              {formData.updated_user?.name && (
                <span className="text-gray-600"> by {formData.updated_user.name}</span>
              )}
            </span>
          </div>
          
          {updatedFields.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">{updatedFields.length} fields</span>
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
          )}
        </div>
        
        {/* {updatedFields.length > 0 && updatedFields.length <= 3 && (
          <div className="mt-2 flex gap-1 flex-wrap">
            {updatedFields.map((field, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {formatFieldName(field)}
              </span>
            ))}
          </div>
        )} */}
      </div>

      {/* Raw data display for reference */}
      {/* <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <h3 className="font-semibold text-gray-700 mb-2">Sample Data Structure:</h3>
        <pre className="text-gray-600 overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div> */}
    </div>
  );
};

export default UpdateInfoComponent;