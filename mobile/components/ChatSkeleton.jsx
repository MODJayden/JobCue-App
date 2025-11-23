import React from 'react';

const ChatSkeleton = () => {
  return (
    <div className="flex-1 bg-white w-full">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3" />
          <div className="flex-1 flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Date Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-200 px-4 py-1.5 rounded-full w-24 h-6 animate-pulse" />
        </div>

        {/* Received Message 1 */}
        <div className="flex items-end mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-2" />
          <div className="max-w-[70%]">
            <div className="bg-gray-200 rounded-2xl rounded-bl px-4 py-3 mb-1 animate-pulse" style={{ borderBottomLeftRadius: 4 }}>
              <div className="h-3 bg-gray-300 rounded w-40 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-32" />
            </div>
            <div className="h-2 bg-gray-200 rounded w-12 ml-1 animate-pulse" />
          </div>
        </div>

        {/* Sent Message 1 */}
        <div className="flex items-end justify-end mb-3">
          <div className="max-w-[70%]">
            <div className="bg-gray-300 rounded-2xl rounded-br px-4 py-3 mb-1 animate-pulse" style={{ borderBottomRightRadius: 4 }}>
              <div className="h-3 bg-gray-400 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-400 rounded w-36" />
            </div>
            <div className="flex justify-end items-center">
              <div className="h-2 bg-gray-200 rounded w-12 mr-1 animate-pulse" />
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Received Message 2 */}
        <div className="flex items-end mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-2" />
          <div className="max-w-[70%]">
            <div className="bg-gray-200 rounded-2xl rounded-bl px-4 py-3 mb-1 animate-pulse" style={{ borderBottomLeftRadius: 4 }}>
              <div className="h-3 bg-gray-300 rounded w-56 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-44 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-28" />
            </div>
            <div className="h-2 bg-gray-200 rounded w-12 ml-1 animate-pulse" />
          </div>
        </div>

        {/* Sent Message 2 (Short) */}
        <div className="flex items-end justify-end mb-3">
          <div className="max-w-[70%]">
            <div className="bg-gray-300 rounded-2xl rounded-br px-4 py-3 mb-1 animate-pulse" style={{ borderBottomRightRadius: 4 }}>
              <div className="h-3 bg-gray-400 rounded w-24" />
            </div>
            <div className="flex justify-end items-center">
              <div className="h-2 bg-gray-200 rounded w-12 mr-1 animate-pulse" />
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Image Message Skeleton */}
        <div className="flex items-end mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-2" />
          <div className="max-w-[70%]">
            <div className="w-52 h-52 bg-gray-200 rounded-2xl animate-pulse mb-1" />
            <div className="h-2 bg-gray-200 rounded w-12 ml-1 animate-pulse" />
          </div>
        </div>

        {/* Sent Message 3 */}
        <div className="flex items-end justify-end mb-3">
          <div className="max-w-[70%]">
            <div className="bg-gray-300 rounded-2xl rounded-br px-4 py-3 mb-1 animate-pulse" style={{ borderBottomRightRadius: 4 }}>
              <div className="h-3 bg-gray-400 rounded w-52 mb-2" />
              <div className="h-3 bg-gray-400 rounded w-40" />
            </div>
            <div className="flex justify-end items-center">
              <div className="h-2 bg-gray-200 rounded w-12 mr-1 animate-pulse" />
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 mx-2">
            <div className="bg-gray-100 rounded-full px-4 py-3 h-12 animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;