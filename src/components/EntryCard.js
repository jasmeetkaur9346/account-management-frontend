import React from "react";
import { TrendingUp, TrendingDown, Calendar, FileText } from "lucide-react";

const EntryCard = ({ entry, onClick }) => {
  const isGiven = entry.type === "given";

  const formatAmount = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    const entryDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (entryDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (entryDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return entryDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white shadow-sm rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md transition"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
    >
      <div className="flex items-start justify-between">
        {/* Left Side - Type and Details */}
        <div className="flex items-start space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isGiven ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            {isGiven ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4
                className={`font-semibold ${
                  isGiven ? "text-green-700" : "text-blue-700"
                }`}
              >
                {isGiven ? "Money Given" : "Money Received"}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isGiven
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isGiven ? "Given" : "Received"}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(entry.date)}</span>
            </div>

            {entry.reason && (
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{entry.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Amount */}
        <div className="text-right">
          <p
            className={`text-xl font-bold ${
              isGiven ? "text-green-600" : "text-blue-600"
            }`}
          >
            {isGiven ? "+" : "-"}
            {formatAmount(entry.amount)}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(entry.date).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
