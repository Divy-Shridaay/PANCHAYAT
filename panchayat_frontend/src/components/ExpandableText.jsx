import { useState } from "react";

const ExpandableText = ({ text, wordLimit = 6 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || !text.trim()) {
    return <span className="text-gray-400">-</span>;
  }

  const words = text.trim().split(/\s+/);
  const isLong = words.length > wordLimit;

  const shortText = words.slice(0, wordLimit).join(" ");

  return (
    <span className="text-sm text-gray-700 leading-relaxed">
      {expanded ? text : shortText}

      {!expanded && isLong && (
        <>
          <span>...</span>
          <span
            onClick={() => setExpanded(true)}
            className="
              cursor-pointer
              text-blue-600
              font-semibold
              hover:text-blue-800
              whitespace-nowrap
            "
          >
            view more
          </span>
        </>
      )}

      {expanded && (
        <span
          onClick={() => setExpanded(false)}
          className="
            ml-1 cursor-pointer
            text-blue-600
            font-semibold
            hover:text-blue-800
            whitespace-nowrap
          "
        >
          view less
        </span>
      )}
    </span>
  );
};

export default ExpandableText;
