import React from 'react';

const Card = () => {
  return (
    <div className="card">
      <a
        href="#"
        className="group relative block max-w-[262px] bg-[#f2f8f9] rounded-[4px] py-8 px-6 m-3 no-underline overflow-hidden"
      >
        {/* expanding circle (replaces :before) */}
        <span
          aria-hidden="true"
          className="absolute -top-4 -right-4 bg-[#00838d] h-8 w-8 rounded-full transform origin-center transition-transform duration-300 group-hover:scale-[21] pointer-events-none z-0"
        />

        <div className="relative z-10">
          <p className="text-[17px] font-normal leading-[20px] text-[#666666] transition-colors duration-300 group-hover:text-white/80">
            This is heading
          </p>
          <p className="text-[14px] text-[#666666] transition-colors duration-300 group-hover:text-white/80">
            Card description with lots of great facts and interesting details.
          </p>
        </div>

        <div className="absolute top-0 right-0 flex items-center justify-center w-8 h-8 bg-[#00838d] rounded-tl-[0px] rounded-tr-[4px] rounded-br-[0px] rounded-bl-[32px] z-20">
          <div className="text-white font-mono -mt-1 -mr-1">→</div>
        </div>
      </a>
    </div>
  );
};

export default Card;
