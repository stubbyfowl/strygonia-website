/* The Strygonia mark in liquid chrome (Paper Shaders' LiquidMetal on the brand mark's silhouette).
   Its own chunk: ChromeMark loads it only when it is near the screen. */
import { LiquidMetal } from "@paper-design/shaders-react";

export default function LiquidMark({ still }: { still: boolean }) {
  return (
    <LiquidMetal
      image="/strygonia-mark.png"
      colorBack="#00000000"
      colorTint="#ffffff"
      repetition={2}
      softness={0.1}
      shiftRed={0.3}
      shiftBlue={0.3}
      distortion={0.07}
      contour={0.4}
      angle={70}
      fit="contain"
      scale={1}
      speed={still ? 0 : 0.8}
      maxPixelCount={1200 * 1200}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
