import type React from "react";
import { useRef, useEffect, useState } from "react";
import { isPresent } from "utils/utilTypes";

interface ResponsiveIframeProps {
  url: string;
  className?: string;
}

const ResponsiveIframe: React.FC<ResponsiveIframeProps> = ({
  url,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: "100%",
    height: "100%",
  });

  useEffect(() => {
    function updateDimensions(): void {
      if (isPresent(containerRef.current)) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: `${width}px`, height: `${height}px` });
      }
    }

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [
    containerRef.current?.getBoundingClientRect().width,
    containerRef.current?.getBoundingClientRect().height,
  ]);

  return (
    <div ref={containerRef} className={`h-full w-full ${className}`}>
      <iframe
        src={url}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          border: "none",
        }}
        title="Responsive Iframe"
      />
    </div>
  );
};

export default ResponsiveIframe;
