import React from "react";

const WaveLoader = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center gap-2.5">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="w-5 bg-gray-600 rounded-full"
          style={{
            height: '5.625rem',
            animation: `
              [wave_5s_ease-in-out_infinite] 
              [keyframes_wave:{0%{height:5.625rem;background-color:#4b5563}25%{height:1.25rem;background-color:#6b7280}50%{height:3.75rem;background-color:#4b5563}75%{height:2.5rem;background-color:#6b7280}100%{height:5.625rem;background-color:#4b5563}}]
              ${item === 1 ? '' : `[animation-delay:${(item - 1) * 2}s]`}
            `,
          }}
        />
      ))}
    </div>
  );
};

export default WaveLoader;