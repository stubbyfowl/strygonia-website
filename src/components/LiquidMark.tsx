/* Liquid chrome (Paper Shaders' LiquidMetal) over a shape: the Strygonia mark by default, or any
   transparent image, such as a word drawn by ChromeText. Its own chunk, loaded on demand. */
import { LiquidMetal } from "@paper-design/shaders-react";

export default function LiquidMark({ still, image = "/strygonia-mark.png" }: { still: boolean; image?: string }) {
  return (
    <LiquidMetal
      image={image}
      suspendWhenProcessingImage
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
